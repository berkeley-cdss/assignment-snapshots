# TODO unit tests
class Api::Debugging::PrintStatementsController < ApplicationController
  CACHE_TTL = 1.hour

  # TODO: don't hardcode this
  IGNORE_LINES = [
    "print('All bees are vanquished. You win!')",
    "print('The bees reached homebase or the queen ant queen has perished. Please try again :(')",
    "print(message)"
  ]

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
      student_email: student.email
    ).order(:created)

    return render json: [] if backups.empty?

    # TODO loop over all files, all backups to construct object key
    # TODO only include print statements that match python print regex but the line must not match any of the IGNORE_LINES
    # TODO don't hardcode only ants.py file

    file_contents = fetch_file_from_local("ants.py")

    # TODO render cached_response
end
