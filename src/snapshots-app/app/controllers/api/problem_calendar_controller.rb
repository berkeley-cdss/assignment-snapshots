class Api::ProblemCalendarController < ApplicationController
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

    calendar_data = BackupMetadatum
      .where(
        course: course.okpy_endpoint,
        assignment: assignment.okpy_endpoint,
        student_email: student.email
      )
      .group("date(created)")
      .count

    render json: calendar_data, status: :ok
  end
end
