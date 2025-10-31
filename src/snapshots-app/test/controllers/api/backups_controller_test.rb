require "test_helper"

class Api::BackupsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_backups_show_url
    assert_response :success
  end
end
