class Api::LintErrorsController < ApplicationController
  def get_file_contents_location(params)
    # NOTE: we assume the okpy endpoint is passed in with - as the separator since / is reserved
    okpy_endpoint_parsed = params[:okpy_endpoint].gsub("-", "/")
    "#{okpy_endpoint_parsed}/#{params[:assignment]}/#{params[:student_id]}/#{params[:backup_id]}/#{params[:file_name]}"
  end

  def show
    file_contents_location = get_file_contents_location(params)

    lint_errors = LintError.where(file_contents_location: file_contents_location)

    if lint_errors.exists?
      render json: { "lint_errors": lint_errors.as_json }, status: :ok
    else
      render json: { "lint_errors": [] }, status: :ok
    end
  end
end
