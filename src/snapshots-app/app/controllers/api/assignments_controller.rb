class Api::AssignmentsController < ApplicationController
  def show
    course_id = params[:course_id].to_i
    course = Course.find_by(id: course_id)
    if course.nil?
      render json: { "error": "Course ID #{course_id} not found" }, status: :not_found
    else
      render json: { "course_id": course_id, "assignments": course.assignments }, status: :ok
    end
  end
end
