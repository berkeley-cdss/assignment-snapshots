require_relative "constants"

class FilesController < ApplicationController
  def show
    # TODO create File model? or call AWS S3 SDK directly?

    if params[:file_name] == "data_processor.py"
      contents = Constants::DATA_PROCESSOR
    elsif params[:file_name] == "web_scraper.py"
      contents = Constants::WEB_SCRAPER
    elsif params[:file_name] == "game_logic.py"
      contents = Constants::GAME_LOGIC
    elsif params[:file_name] == "autograder_output.txt"
      contents = Constants::AUTOGRADER_OUTPUT
    else
      render json: { "error": "File not found" }, status: :not_found
      return
    end
    render json: { "okpy_endpoint": params[:okpy_endpoint], "assignment": params[:assignment], "student_id": params[:student_id], "backup_id": params[:backup_id], "file_name": params[:file_name], "file_contents": contents }
  end
end
