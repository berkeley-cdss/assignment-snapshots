class Api::BackupFileMetadatumController < ApplicationController
  def show
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

    # TODO caching?

    assignment_file_names = AssignmentFile.where(assignment_id: assignment_id).map { |af| af.file_name }
    backup_metadata = BackupMetadatum.where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint, student_email: student.email).order(:created)
    file_contents_locations = backup_metadata.filter_map do |backup|
      # Only backups with student code file contents and autograder output will be included in the timeline UI
      if backup.file_contents_location.present? and backup.autograder_output_location.present?
        backup.file_contents_location
      else
        nil
      end
    end

    file_names_to_num_lines_array = {}

    assignment_file_names.each do |file_name|
      file_names_to_num_lines_array[file_name] = []
    end

    file_contents_locations.each do |file_contents_location|
      assignment_file_names.each do |file_name|
        backup_file_metadatum = BackupFileMetadatum.find_by(file_contents_location: file_contents_location, file_name: file_name)
        if !backup_file_metadatum.nil?
          file_names_to_num_lines_array[file_name] << backup_file_metadatum.num_lines
        end
      end
    end

    render json: { "course_id": course_id, "assignment_id": assignment_id, "user_id": user_id, "file_names_to_num_lines_array": file_names_to_num_lines_array }, status: :ok
  end
end
