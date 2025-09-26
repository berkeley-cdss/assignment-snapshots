class Api::CoursesController < ApplicationController
  def show
    # TODO retrieve from database based on user id; for now we hardcode
    # if user id not found, then 404?
    user_id = params[:user_id]
    courses = Course.all
    render json: { "user_id": user_id, "courses": courses }
  end
end
