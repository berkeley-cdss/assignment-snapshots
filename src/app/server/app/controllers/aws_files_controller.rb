class AwsFilesController < ApplicationController
  def show
    # TODO don't hardcode this
    bucket_name = 'ucb-assignment-snapshots-eae254943a2c4f51bef67654e99560dd' # us-west-2 bucket
    object_key = 'autograder_output.txt'
    @file_content = AwsFile.new.read_s3_file(bucket_name, object_key)

    if @file_content
      render plain: @file_content
    else
      render plain: "Error reading file from S3.", status: :internal_server_error
    end
  end
end