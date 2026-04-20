# TODO unit tests
class Api::Debugging::PrintStatementsController < ApplicationController
  CACHE_TTL = 1.hour

  # TODO: don't hardcode this
  IGNORE_LINES = [
    "print('All bees are vanquished. You win!')",
    "print('The bees reached homebase or the queen ant queen has perished. Please try again :(')",
    "print(message)"
  ].freeze

  # Regex for Python print statements: print(...)
  PRINT_REGEX = /^\s*print\s*\(.*\)/

  # TODO deduplicate from FilesController
  def fetch_file_from_local(object_key)
    file_path = Rails.root.join("../../data/private/#{object_key}")
    if File.exist?(file_path)
      file_contents = File.read(file_path)
      { json: { "object_key": object_key, "file_contents": file_contents }, status: :ok }
    else
      error = "File not found at path: #{file_path}"
      Rails.logger.error(error)
      { json: { "error": error }, status: :not_found }
    end
  end

  def fetch_cached_file(object_key)
    cache_key = "local_file:#{object_key}"
    Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
      Rails.logger.info("Cache MISS for cache_key #{cache_key}. Fetching from local file system...")
      fetch_file_from_local(object_key)
    end
  end

  def contains_user_print?(contents)
    contents.lines.any? do |line|
      trimmed = line.strip
      # Line matches print regex AND is not in our ignore list
      trimmed.match?(PRINT_REGEX) && !IGNORE_LINES.include?(trimmed)
    end
  end

  def show
    # Validate params
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i
    user_id = params[:user_id].to_i

    course = Course.find_by(id: course_id)
    if course.nil?
      render json: { "error": "Course ID #{course_id} not found" }, status: :not_found
      return
    end

    assignment = course.assignments.find_by(id: assignment_id)
    if assignment.nil?
      render json: { "error": "Assignment ID #{assignment_id} not found within course ID #{course_id}" }, status: :not_found
      return
    end

    student = course.students.find_by(id: user_id)
    if student.nil?
      render json: { "error": "User ID #{user_id} not a student in course ID #{course_id}" }, status: :not_found
      return
    end

    # TODO error if student doesn't have any backups for this assignment and course

    backups = BackupMetadatum.where(
      course: course.okpy_endpoint,
      assignment: assignment.okpy_endpoint,
      student_email: student.email,
      # exclude unlocking tests
      unlock_location: nil
    ).order(:created)

    return render json: [] if backups.empty?

    # Map all backups to their raw data first
    all_data = backups.each_with_index.map do |backup, index|
      grading = GradingMessageQuestion.where(backup_id: backup.backup_id)
      is_passing = grading.any? && grading.all? { |q| q.failed == 0 }

      analytics = AnalyticsMessage.find_by(backup_id: backup.backup_id)
      problem_names = analytics&.question_display_names || []

      object_key = File.join(backup.file_contents_location, "ants.py")
      file_result = fetch_cached_file(object_key)
      contents = file_result[:json][:file_contents] || ""
      has_print = contains_user_print?(contents)

      {
        id: backup.backup_id,
        problem: problem_names.join(", "),
        timestamp: backup.created,
        passing: is_passing,
        # TODO don't hardcode this (other assignments may have multiple files)
        files: [ { name: "ants.py", contents: contents, hasPrint: has_print } ],
        has_print: has_print # internal flag for grouping
      }
    end

    # Identify the indices of backups that contain prints
    # TODO investigate why problem name can be empty. perhaps they just ran `python3 ok` without specifying a problem?
    print_indices = all_data.each_index.select { |i| all_data[i][:has_print] and all_data[i][:problem] != "" }

    return render json: [] if print_indices.empty?

    # Group consecutive print indices and same problem name into sessions
    # e.g., [1, 2, 5, 6, 7] -> [[1, 2], [5, 6, 7]]
    sessions = []
    if print_indices.any?
      current_session = [ print_indices.first ]
      print_indices[1..].each do |idx|
        prev_idx = current_session.last
        if idx == prev_idx + 1 and all_data[prev_idx][:problem] == all_data[idx][:problem]
          current_session << idx
        else
          sessions << current_session
          current_session = [ idx ]
        end
      end
      sessions << current_session
    end

    # Expand sessions to include +/- 5 backups with the same problem and flatten/deduplicate
    # Use a Set to ensure that if sessions overlap (within 10 backups of each other),
    # we don't include the same backup twice.
    final_indices = Set.new
    sessions.each do |session_range|
      start_idx = [ 0, session_range.min - 5 ].max
      end_idx = [ all_data.length - 1, session_range.max + 5 ].min

      (start_idx..end_idx).each do |i|
        if all_data[i][:problem] == all_data[session_range[0]][:problem]
          final_indices.add(i)
        end
      end
    end

    # Extract the data for the final indices and sort by timestamp
    # We remove the internal 'has_print' key used for logic before rendering
    result = final_indices.to_a.sort.map do |idx|
      all_data[idx].except(:has_print)
    end

    render json: result
  end
end
