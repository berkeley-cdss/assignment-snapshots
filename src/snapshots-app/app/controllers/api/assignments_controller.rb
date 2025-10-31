class Api::AssignmentsController < ApplicationController
  def show
    # TODO retrieve from database based on user id; for now we hardcode
    # if user id not found, then 404?
    user_id = params[:user_id] # TODO do we actually need this to get the assignments for a course?
    course_id = params[:course_id]

    assignments = Assignment.where(course_id: course_id)
    render json: { "user_id": user_id, "course_id": course_id, "assignments": assignments }
  end
end
