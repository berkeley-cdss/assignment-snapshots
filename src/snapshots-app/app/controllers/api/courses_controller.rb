class Api::CoursesController < ApplicationController
  def show
    # TODO retrieve from database based on user id; for now we hardcode
    user_id = params[:user_id]
    courses = [
      {
        :id => 1,
        :course => "CS 61A",
        :name => "Structure and Interpretation of Computer Programs",
        :term => "Fall 2025"
      },
      {
        :id => 2,
        :course => "DATA C88C",
        :name => "Computational Structures in Data Science",
        :term => "Spring 2025"
      },
      {
        :id => 3,
        :course => "CS 61B",
        :name => "Data Structures",
        :term => "Fall 2023"
      },
    ]
    render json: { "user_id": user_id, "courses": courses }
  end
end
