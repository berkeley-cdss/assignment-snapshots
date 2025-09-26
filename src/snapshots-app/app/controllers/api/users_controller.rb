class Api::UsersController < ApplicationController
  def show
    user_email = params[:email]
    User.where(email: user_email)
  end
end
