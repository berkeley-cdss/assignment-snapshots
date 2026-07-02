class Api::SubmissionsController < ApplicationController
  def show
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i

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

    student_emails_with_submissions = BackupMetadatum
                .where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint)
                .pluck(:student_email)
                .to_set

    submissions = []
    course.students.each do |student|
      if student_emails_with_submissions.member?(student.email)
        submissions << student
      end
    end

    render json: { "course_id": course_id, "assignment_id": assignment_id, "submissions": submissions }, status: :ok
  end
end
