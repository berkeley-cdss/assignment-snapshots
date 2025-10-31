require "test_helper"

class Api::SubmissionsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_submissions_show_url
    assert_response :success
  end
end
