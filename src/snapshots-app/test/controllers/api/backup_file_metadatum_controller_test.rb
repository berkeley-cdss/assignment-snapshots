require "test_helper"

class Api::BackupFileMetadatumControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @cs61a = courses(:cs61a)
    @datac88c = courses(:datac88c)

    @ants_cs61a = assignments(:ants_cs61a)
    @maps_datac88c = assignments(:maps_datac88c)

    @alice = users(:alice)
    @bob = users(:bob)

    @alice_ants_metadata_1 = backup_file_metadata(:alice_ants_metadata_1)
    @alice_ants_metadata_2 = backup_file_metadata(:alice_ants_metadata_2)
    @bob_maps_utils_metadata = backup_file_metadata(:bob_maps_utils_metadata)
    @bob_maps_abstractions_metadata = backup_file_metadata(:bob_maps_abstractions_metadata)
    @bob_maps_recommend_metadata = backup_file_metadata(:bob_maps_recommend_metadata)
  end

  def api_backup_file_metadatum_url(course_id, assignment_id, user_id)
    "/api/backup_file_metadatum/#{course_id}/#{assignment_id}/#{user_id}"
  end

  test "should return 200 OK and backup file metadata for a valid course, assignment, and student" do
    # Works for CS 61A Ants
    get api_backup_file_metadatum_url(@cs61a.id, @ants_cs61a.id, @alice.id)
    assert_response :ok

    response_json = JSON.parse(@response.body)

    # Check top-level structure
    assert_equal @cs61a.id, response_json["course_id"]
    assert_equal @ants_cs61a.id, response_json["assignment_id"]
    assert_equal @alice.id, response_json["user_id"]

    # Check files_to_metadata hash
    assert_equal ["ants.py"], response_json["files_to_metadata"].keys.sort
    assert_equal [@alice_ants_metadata_1.num_lines, @alice_ants_metadata_2.num_lines], response_json["files_to_metadata"]["ants.py"]["num_lines"]

    # Works for Data C88C Maps
    get api_backup_file_metadatum_url(@datac88c.id, @maps_datac88c.id, @bob.id)
    assert_response :ok

    response_json = JSON.parse(@response.body)

    # Check top-level structure
    assert_equal @datac88c.id, response_json["course_id"]
    assert_equal @maps_datac88c.id, response_json["assignment_id"]
    assert_equal @bob.id, response_json["user_id"]

    # Check files_to_metadata hash
    assert_equal ["abstractions.py", "recommend.py", "utils.py"], response_json["files_to_metadata"].keys.sort
    assert_equal [@bob_maps_utils_metadata.num_lines], response_json["files_to_metadata"]["utils.py"]["num_lines"]
    assert_equal [@bob_maps_abstractions_metadata.num_lines], response_json["files_to_metadata"]["abstractions.py"]["num_lines"]
    assert_equal [@bob_maps_recommend_metadata.num_lines], response_json["files_to_metadata"]["recommend.py"]["num_lines"]
  end

  test "should return 404 Not Found if Course ID is invalid" do
    invalid_course_id = 999999
    get api_backup_file_metadatum_url(invalid_course_id, @ants_cs61a.id, @alice.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Course ID #{invalid_course_id} not found", response_json["error"]
  end

  test "should return 404 Not Found if Assignment ID is invalid for the Course" do
    invalid_assignment_id = 999999
    get api_backup_file_metadatum_url(@cs61a.id, invalid_assignment_id, @alice.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Assignment ID #{invalid_assignment_id} not found within course ID #{@cs61a.id}", response_json["error"]
  end

  test "should return 404 Not Found if User ID is not a student in the Course" do
    get api_backup_file_metadatum_url(@cs61a.id, @ants_cs61a.id, @bob.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "User ID #{@bob.id} not a student in course ID #{@cs61a.id}", response_json["error"]
  end
end
