class Api::CoursesController < ApplicationController
  def show
    user_email = params[:email]
    if !user_email.present?
      render json: { "error": "User email must be provided as query parameter" }, status: :bad_request
    else
      user = User.find_by(email: user_email)
      if user.nil?
        render json: { "error": "User email #{user_email} not found" }, status: :not_found
      else
        render json: { "user_email": user_email, "courses": user.courses_taught }, status: :ok
      end
    end
  end
end
