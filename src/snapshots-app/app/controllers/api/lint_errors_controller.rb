class Api::LintErrorsController < ApplicationController
  def show
    file_contents_location = params[:file_contents_location]
    if !file_contents_location.present?
      render json: { "error": "file_contents_location parameter is required" }, status: :bad_request
      return
    end

    lint_errors = LintError.where(file_contents_location: file_contents_location)

    if lint_errors.exists?
      render json: { "lint_errors": lint_errors.as_json }, status: :ok
    else
      render json: { "lint_errors": [] }, status: :ok
    end
  end
end
