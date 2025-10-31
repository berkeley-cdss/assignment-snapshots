require "test_helper"

class Api::AssignmentsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_assignments_show_url
    assert_response :success
  end
end
