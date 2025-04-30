require 'aws-sdk-s3'

S3_BUCKET_NAME = 'ucb-assignment-snapshots-eae254943a2c4f51bef67654e99560dd'
S3_BUCKET_REGION = 'us-west-2'

class FilesController < ApplicationController
  def get_object_key(params)
    return 'autograder_output.txt' # TODO don't hardcode this, use below instead
    # return "#{:okpy_endpoint}/#{:assignment}/#{:student_id}/#{:backup_id}/#{:file_name}"
  end

  def show
    # uses default credentials for local dev - see src/app/server/README.md to configure using AWS CLI
    s3 = Aws::S3::Client.new(region: S3_BUCKET_REGION)

    file_contents = nil
    error = nil
    status = :internal_server_error

    object_key = get_object_key(params)

    begin
      resp = s3.get_object(bucket: S3_BUCKET_NAME, key: object_key)
      file_contents = resp.body.read.force_encoding('UTF-8') # Assuming UTF-8 encoding
      status = :ok
    rescue Aws::S3::Errors::NoSuchBucket => e
      error = "Error: Bucket not found: #{bucket_name}"
      status = :not_found
    rescue Aws::S3::Errors::NoSuchKey => e
      error = "Error: File #{object_key} not found in S3 - #{e.message}"
      status = :not_found
    rescue Aws::S3::Errors::ServiceError => e
      error = "Error accessing S3: #{e.message}"
    rescue StandardError => e
      error = "Unknown error occurred: #{e.message}"
    end

    if file_contents
      render json: { "file_contents": file_contents }, status: status
    else
      Rails.logger.error(error)
      render json: { "error": error }, status: status
    end
  end
end
