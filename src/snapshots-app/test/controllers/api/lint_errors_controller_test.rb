require "test_helper"

class Api::LintErrorsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_lint_errors_show_url
    assert_response :success
  end
end
