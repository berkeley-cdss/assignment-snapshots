require "ostruct"
require 'stringio'
require "test_helper"

require_relative '../../app/controllers/files_controller'

class FilesControllerTest < ActionDispatch::IntegrationTest
  raw_okpy_endpoint = "cal-cs88-sp25"
  assignment = "maps"
  student_id = "abc123"
  backup_id = "def456"
  route_prefix = "/files/#{raw_okpy_endpoint}/#{assignment}/#{student_id}/#{backup_id}"
  unknown_file = "unknown.txt"
  known_files = ["utils.py", "abstractions.py", "recommend.py", "autograder_output.txt"]
  file_contents = ["foo", "bar", "baz", "qux"]

  test "should respond with 404 Not Found if file name unknown" do
    # Mock AWS S3 client
    Aws::S3::Client.any_instance
      .stubs(:get_object)
      .with(bucket: S3_BUCKET_NAME, key: "cal/cs88/sp25/#{assignment}/#{student_id}/#{backup_id}/#{unknown_file}")
      .raises(Aws::S3::Errors::NoSuchKey.new(nil, 'The specified key does not exist.'))

    get "#{route_prefix}/#{unknown_file}"
    assert_response :missing
  end

  test "should respond with 200 OK and file contents if file name is known" do
    for i in 0...known_files.size
      # Mock AWS S3 client
      Aws::S3::Client.any_instance
        .stubs(:get_object)
        .with(bucket: S3_BUCKET_NAME, key: "cal/cs88/sp25/#{assignment}/#{student_id}/#{backup_id}/#{known_files[i]}")
        .returns(OpenStruct.new(body: StringIO.new(file_contents[i])))

      get "#{route_prefix}/#{known_files[i]}"

      assert_response :success
      assert_equal(@response.parsed_body["file_contents"], file_contents[i])
    end
  end
end
