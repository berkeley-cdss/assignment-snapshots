require "test_helper"

class FilesControllerTest < ActionDispatch::IntegrationTest
  route_prefix = "/files/a/b/c/d"
  known_files = [ "data_processor.py", "web_scraper.py", "game_logic.py", "autograder_output.txt" ]
  file_contents = [ Constants::DATA_PROCESSOR, Constants::WEB_SCRAPER, Constants::GAME_LOGIC, Constants::AUTOGRADER_OUTPUT ]

  test "should respond with 404 Not Found if file name unknown" do
    get "#{route_prefix}/unknown.txt"
    assert_response :missing
  end

  test "should respond with 200 OK and correct response body if file name is known" do
    for i in 0...known_files.size
      get "#{route_prefix}/#{known_files[i]}"

      assert_response :success

      assert_equal("a", @response.parsed_body["okpy_endpoint"])
      assert_equal("b", @response.parsed_body["assignment"])
      assert_equal("c", @response.parsed_body["student_id"])
      assert_equal("d", @response.parsed_body["backup_id"])
      assert_equal(file_contents[i], @response.parsed_body["file_contents"])
    end
  end
end
