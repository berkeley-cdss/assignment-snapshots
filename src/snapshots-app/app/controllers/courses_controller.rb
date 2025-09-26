class CoursesController < ApplicationController
  layout :resolve_layout

  # Display different layout depending on action
  def resolve_layout
    case action_name
    when "show"
      "course"
    else
      "courses"
    end
  end

  def index
  end

  def show
  end
end
