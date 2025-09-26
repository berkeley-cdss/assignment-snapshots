class Api::CoursesController < ApplicationController
  def show
    # TODO join instead?
    user_email = params[:email]

    if !user_email.present?
      render json: { "error": "User email must be provided as query parameter" }, status: :bad_request
    else
      users = User.where(email: user_email)

      if users.empty?
        render json: { "error": "User email #{user_email} not found" }, status: :not_found
      else
        course_ids = []
        users.each do |user|
          course_ids << user.course_id
        end

        courses = []
        course_ids.each do |id|
          courses << Course.find_by(id: id)
        end
        render json: { "user_email": user_email, "courses": courses }
      end
    end
  end
end
