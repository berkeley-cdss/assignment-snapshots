require 'aws-sdk-s3'

class S3File < ApplicationRecord
  def read_s3_file(bucket_name, object_key)
    s3 = Aws::S3::Client.new(
      region: 'us-west-1',
      # TODO figure out credentials/authentication
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
    )

    begin
      resp = s3.get_object(bucket: bucket_name, key: object_key)
      file_content = resp.body.read.force_encoding('UTF-8') # Assuming UTF-8 encoding
      return file_content
    rescue Aws::S3::Errors::NoSuchKey => e
      Rails.logger.error("Error: File not found in S3 - #{e.message}")
      return nil
    rescue Aws::S3::Errors::ServiceError => e
      Rails.logger.error("Error accessing S3: #{e.message}")
      return nil
    end
  end
end
