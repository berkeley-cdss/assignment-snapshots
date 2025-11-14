require "test_helper"

class Api::BackupFileMetadatumControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_backup_file_metadatum_show_url
    assert_response :success
  end
end
