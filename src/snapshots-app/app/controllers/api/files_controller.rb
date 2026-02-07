require "aws-sdk-s3"

# TODO: update tests

S3_BUCKET_NAME = "ucb-assignment-snapshots-eae254943a2c4f51bef67654e99560dd"
S3_BUCKET_REGION = "us-west-2"

class Api::FilesController < ApplicationController
  CACHE_TTL = 1.hour

  def show
    object_key = params[:object_key]

    if !object_key.present?
      error = "Missing required query parameter: object_key"
      Rails.logger.error(error)
      render json: { "error": error }, status: :bad_request
      return
    end

    use_aws = params[:use_aws]

    if !use_aws.present?
      Rails.logger.info("No use_aws parameter provided, defaulting to false")
      use_aws = false
    elsif use_aws == "true"
      Rails.logger.info("use_aws parameter was 'true', using AWS to fetch file")
      use_aws = true
    elsif use_aws == "false"
      Rails.logger.info("use_aws parameter was 'false', using local file")
      use_aws = false
    else
      error = "Invalid value for optional use_aws parameter: #{use_aws}. Expected 'true' or 'false'."
      Rails.logger.error(error)
      render json: { "error": error }, status: :bad_request
      return
    end

    if use_aws
      cache_key = "s3_file:#{object_key}"
      cached_response = Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        Rails.logger.info("Cache MISS for cache_key #{cache_key}. Fetching from S3...")
        fetch_file_from_s3(object_key)
      end
      render cached_response
    else
      cache_key = "local_file:#{object_key}"
      cached_response = Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
        Rails.logger.info("Cache MISS for cache_key #{cache_key}. Fetching from local file system...")
        fetch_file_from_local(object_key)
      end
      render cached_response
    end
  end

  private

  def fetch_file_from_s3(object_key)
    # uses default credentials for local dev - see src/app/server/README.md to configure using AWS CLI
    s3 = Aws::S3::Client.new(region: S3_BUCKET_REGION)

    file_contents = nil
    error = nil
    status = :internal_server_error

    begin
      Rails.logger.info("Fetching #{object_key} from S3")
      resp = s3.get_object(bucket: S3_BUCKET_NAME, key: object_key)
      Rails.logger.info("Successfully fetched #{object_key} from S3")
      file_contents = resp.body.read.force_encoding("UTF-8") # Assuming UTF-8 encoding
      status = :ok
    rescue Aws::S3::Errors::NoSuchBucket => e
      error = "#{e.message} S3 bucket: #{e.context.params[:bucket]}"
      status = :not_found
    rescue Aws::S3::Errors::NoSuchKey => e
      error = "#{e.message} S3 object key: #{e.context.params[:key]}"
      status = :not_found
    rescue Aws::S3::Errors::ServiceError => e
      error = "Error accessing S3: #{e.message} Request context params: #{e.context.params}"
    rescue StandardError => e
      error = "Unknown error occurred when fetching files from S3: #{e.message} Request context params: #{e.context.params}"
    end

    if file_contents
      { json: { "object_key": object_key, "file_contents": file_contents }, status: status }
    else
      Rails.logger.error(error)
      { json: { "error": error }, status: status }
    end
  end

  def fetch_file_from_local(object_key)
    file_path = Rails.root.join("../../data/private/#{object_key}")
    if File.exist?(file_path)
      file_contents = File.read(file_path)
      { json: { "object_key": object_key, "file_contents": file_contents }, status: :ok }
    else
      error = "File not found at path: #{file_path}"
      Rails.logger.error(error)
      { json: { "error": error }, status: :not_found }
    end
  end
end
