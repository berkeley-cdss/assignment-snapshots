require 'aws-sdk-s3'

class AwsFile < ApplicationRecord
  def read_s3_file(bucket_name, object_key)
    s3 = Aws::S3::Client.new(region: 'us-west-2') # use default credentials (aws configure sso using us-west-2)

    # TODO move API call into controller and render json instead
    begin
      resp = s3.get_object(bucket: bucket_name, key: object_key)
      file_content = resp.body.read.force_encoding('UTF-8') # Assuming UTF-8 encoding
      return file_content
    rescue Aws::S3::Errors::NoSuchBucket => e
      Rails.logger.error("Error: Bucket not found: #{bucket_name}")
      return nil
    rescue Aws::S3::Errors::NoSuchKey => e
      Rails.logger.error("Error: File #{object_key} not found in S3 - #{e.message}")
      return nil
    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error("Error accessing S3: #{e.message}")
      return nil
    end
  end
end
