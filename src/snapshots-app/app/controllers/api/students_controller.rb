class Api::StudentsController < ApplicationController
  def show
    course_id = params[:course_id]
    students = Student.where(course_id: course_id)
    render json: { "course_id": course_id, "students": students }
  end
end
