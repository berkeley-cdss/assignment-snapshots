class S3FileController < ApplicationController
  def show_file
    # TODO don't hardcode this
    bucket_name = 'ucb-assignment-snapshots-905fa3f1b1b745cfb59eebe394249588'
    object_key = 'autograder_output.txt'
    @file_content = S3File.new.read_s3_file(bucket_name, object_key)

    if @file_content
      render plain: @file_content
    else
      render plain: "Error reading file from S3.", status: :internal_server_error
    end
  end
end