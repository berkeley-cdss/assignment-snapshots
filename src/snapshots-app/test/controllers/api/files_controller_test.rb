require "ostruct"
require "stringio"
require "test_helper"

# Required to get S3_BUCKET_NAME constant
require_relative "../../../app/controllers/api/files_controller"

class Api::FilesControllerTest < ActionDispatch::IntegrationTest
  known_files = [ "utils.py", "abstractions.py", "recommend.py", "autograder_output.txt" ]
  file_contents = [ "foo", "bar", "baz", "qux" ]

  test "should respond with 404 Not Found if file name unknown" do
    object_key = "unknown/path/to/file.txt"
    dummy_s3_context = OpenStruct.new(:params => {:key => object_key})

    # Mock AWS S3 client
    Aws::S3::Client.any_instance
      .stubs(:get_object)
      .with(bucket: S3_BUCKET_NAME, key: object_key)
      .raises(Aws::S3::Errors::NoSuchKey.new(dummy_s3_context, "The specified key does not exist."))

    get "/api/files", params: { object_key: object_key }
    assert_response :missing
  end

  test "should respond with 200 OK and file contents if file name is known" do
    for i in 0...known_files.size
      object_key = "cal/cs88/sp25/maps/abc123/def456/#{known_files[i]}"

      # Mock AWS S3 client
      Aws::S3::Client.any_instance
        .stubs(:get_object)
        .with(bucket: S3_BUCKET_NAME, key: object_key)
        .returns(OpenStruct.new(body: StringIO.new(file_contents[i])))

      get "/api/files", params: { object_key: object_key }

      assert_response :success
      assert_equal(@response.parsed_body["file_contents"], file_contents[i])
    end
  end
end
