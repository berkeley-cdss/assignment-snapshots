class Api::BackupFileMetadatumController < ApplicationController
  CACHE_TTL = 1.hour

  def show
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i
    user_id = params[:user_id].to_i

    cache_key = "backup_file_metadatum:#{course_id}:#{assignment_id}:#{user_id}"

    cached_response = Rails.cache.fetch(cache_key, ttl: CACHE_TTL) do
      Rails.logger.info("Cache MISS for cache_key #{cache_key}. Fetching from database...")

      course = Course.find_by(id: course_id)
      if course.nil?
        return { json: { "error": "Course ID #{course_id} not found" }, status: :not_found }
      end

      assignment = course.assignments.find_by(id: assignment_id)
      if assignment.nil?
        return { json: { "error": "Assignment ID #{assignment_id} not found within course ID #{course_id}" }, status: :not_found }
      end

      student = course.students.find_by(id: user_id)
      if student.nil?
        return { json: { "error": "User ID #{user_id} not a student in course ID #{course_id}" }, status: :not_found }
      end

      # TODO error if student doesn't have any backups for this assignment and course

      assignment_file_names = AssignmentFile.where(assignment_id: assignment_id).map { |af| af.file_name }
      backup_metadata = BackupMetadatum.where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint, student_email: student.email).order(:created)
      created_and_file_location = backup_metadata.filter_map do |backup|
        # Only backups with student code file contents and autograder output will be included in the timeline UI
        if backup.file_contents_location.present? and backup.autograder_output_location.present?
          [backup.created, backup.file_contents_location]
        else
          nil
        end
      end

      files_to_metadata = {}

      assignment_file_names.each do |file_name|
        files_to_metadata[file_name] = {:created => [], :num_lines => []}
      end

      created_and_file_location.each do |created, file_contents_location|
        assignment_file_names.each do |file_name|
          backup_file_metadatum = BackupFileMetadatum.find_by(file_contents_location: file_contents_location, file_name: file_name)
          if !backup_file_metadatum.nil?
            files_to_metadata[file_name][:created] << created
            files_to_metadata[file_name][:num_lines] << backup_file_metadatum.num_lines
          end
        end
      end

      { json: { "course_id": course_id, "assignment_id": assignment_id, "user_id": user_id, "files_to_metadata": files_to_metadata }, status: :ok }
    end

    render cached_response
  end
end
