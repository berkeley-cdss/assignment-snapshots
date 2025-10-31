class Api::BackupsController < ApplicationController
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

    backup_metadata = BackupMetadatum.where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint, student_email: student.email)
    backups = backup_metadata.map do |backup|
      {
        backup_id: backup.backup_id,
        created: backup.created,
        course: backup.course,
        assignment: backup.assignment,
        student_id: backup.student_email,
        file_contents_location: backup.file_contents_location,
        autograder_output_location: backup.autograder_output_location
      }
    end
    render json: { "course_id": course_id, "assignment_id": assignment_id, "user_id": user_id, "backups": backups }, status: :ok
  end
end
