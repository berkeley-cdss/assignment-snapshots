require "test_helper"

class Api::LintErrorsControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @error_one = lint_errors(:recommend_unused_import)
    @error_two = lint_errors(:recommend_whitespace)
    @error_three = lint_errors(:lab00_whitespace)

    @maps_datac88c_params = {
      okpy_endpoint: "cal-cs88-fa25",
      assignment: "maps",
      student_id: "student_id",
      backup_id: "backup_id",
      file_name: "recommend.py"
    }

    @lab00_cs61a_params = {
      okpy_endpoint: "cal-cs61a-fa25",
      assignment: "lab00",
      student_id: "student_id",
      backup_id: "backup_id",
      file_name: "lab00.py"
    }

    # Parameters that match no existing lint errors (e.g., different student/backup)
    @no_match_params = {
      okpy_endpoint: "cal-cs88-fa25",
      assignment: "maps",
      student_id: "nonexistent_student",
      backup_id: "nonexistent_backup",
      file_name: "nonexistent.py"
    }
  end

  def lint_errors_url(params)
    "/api/lint_errors/#{params[:okpy_endpoint]}/#{params[:assignment]}/#{params[:student_id]}/#{params[:backup_id]}/#{params[:file_name]}"
  end

  def assert_lint_error_structure(error_json, expected_fixture)
    assert_equal expected_fixture.file_contents_location, error_json["file_contents_location"]
    assert_equal expected_fixture.line_number, error_json["line_number"]
    assert_equal expected_fixture.message, error_json["message"]
    assert_equal expected_fixture.code, error_json["code"]
    assert_equal expected_fixture.url, error_json["url"]
  end

  test "should return 200 OK and a list of lint errors when file contents location matches" do
    # Works for Data C88C Maps
    get lint_errors_url(@maps_datac88c_params)
    assert_response :ok

    response_json = JSON.parse(@response.body)
    lint_errors_data = response_json["lint_errors"]

    assert_equal 2, lint_errors_data.size # Should find the two errors for Alice's backup

    # Check that both fixtures appear in the response, order-independent
    found_one = lint_errors_data.find do |e|
      e["file_contents_location"] == @error_one.file_contents_location &&
      e["message"] == @error_one.message
    end
    assert_not_nil found_one, "Expected @error_one to be present in response"
    assert_lint_error_structure(found_one, @error_one)

    found_two = lint_errors_data.find do |e|
      e["file_contents_location"] == @error_two.file_contents_location &&
      e["message"] == @error_two.message
    end
    assert_not_nil found_two, "Expected @error_two to be present in response"
    assert_lint_error_structure(found_two, @error_two)

    # Works for CS 61A Lab 00
    get lint_errors_url(@lab00_cs61a_params)
    assert_response :ok

    response_json = JSON.parse(@response.body)
    lint_errors_data = response_json["lint_errors"]

    assert_equal 1, lint_errors_data.size

    assert_lint_error_structure(lint_errors_data[0], @error_three)
  end

  test "should return 200 OK and an empty list when no lint errors are found" do
    get lint_errors_url(@no_match_params)
    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal [], response_json["lint_errors"]
  end
end
