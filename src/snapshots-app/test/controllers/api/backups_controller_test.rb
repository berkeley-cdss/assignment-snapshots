require "test_helper"

class Api::BackupsControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @cs61a = courses(:cs61a)
    @datac88c = courses(:datac88c)

    @ants_cs61a = assignments(:ants_cs61a)
    @lab00_cs61a = assignments(:lab00_cs61a)
    @maps_datac88c = assignments(:maps_datac88c)

    @alice = users(:alice)
    @bob = users(:bob)

    @alice_ants_1 = backup_metadata(:alice_ants_1)
    @alice_ants_2 = backup_metadata(:alice_ants_2)
    @bob_maps = backup_metadata(:bob_maps)
  end

  def api_backups_url(course_id, assignment_id, user_id)
    "/api/backups/#{course_id}/#{assignment_id}/#{user_id}"
  end

  # assert_equal of nil values will break in minitest 6 so preemptively using assert_nil instead
  def assert_equal_or_nil(expected, actual)
    if expected.nil?
      assert_nil actual
    else
      assert_equal expected, actual
    end
  end

  def assert_backup_structure(backup_json, expected_backup_fixture)
    assert_equal expected_backup_fixture.backup_id, backup_json["backup_id"]
    assert_equal expected_backup_fixture.created, backup_json["created"]
    assert_equal_or_nil expected_backup_fixture.file_contents_location, backup_json["file_contents_location"]
    assert_equal_or_nil expected_backup_fixture.autograder_output_location, backup_json["autograder_output_location"]
  end

  test "should return 200 OK and multiple backups for a valid course, assignment, and student" do
    # Works for CS 61A Ants
    get api_backups_url(@cs61a.id, @ants_cs61a.id, @alice.id)
    assert_response :ok

    response_json = JSON.parse(@response.body)

    # Check top-level structure
    assert_equal @cs61a.id, response_json["course_id"]
    assert_equal @ants_cs61a.id, response_json["assignment_id"]
    assert_equal @alice.id, response_json["user_id"]

    # Check backups array
    backups_data = response_json["backups"]
    assert_equal 2, backups_data.size # Alice has two backups for Ants

    # Check the contents of the first backup (order might vary)
    backups_data.each do |backup|
      case backup["backup_id"]
      when @alice_ants_1.backup_id
        assert_backup_structure(backup, @alice_ants_1)
      when @alice_ants_2.backup_id
        assert_backup_structure(backup, @alice_ants_2)
      else
        flunk "Unexpected backup_id #{backup['backup_id']} found in response"
      end
    end

    # Works for Data C88C Maps
    get api_backups_url(@datac88c.id, @maps_datac88c.id, @bob.id)
    assert_response :ok

    response_json = JSON.parse(@response.body)

    # Check top-level structure
    assert_equal @datac88c.id, response_json["course_id"]
    assert_equal @maps_datac88c.id, response_json["assignment_id"]
    assert_equal @bob.id, response_json["user_id"]

    # Check backups array
    backups_data = response_json["backups"]
    assert_equal 1, backups_data.size # Bob has one backup for Maps

    # Check the contents of the backup
    backup = backups_data[0]
    assert_backup_structure(backup, @bob_maps)
  end

  test "should return 404 Not Found if Course ID is invalid" do
    invalid_course_id = 999999
    get api_backups_url(invalid_course_id, @ants_cs61a.id, @alice.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Course ID #{invalid_course_id} not found", response_json["error"]
  end

  test "should return 404 Not Found if Assignment ID is invalid for the Course" do
    invalid_assignment_id = 999999
    get api_backups_url(@cs61a.id, invalid_assignment_id, @alice.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Assignment ID #{invalid_assignment_id} not found within course ID #{@cs61a.id}", response_json["error"]
  end

  test "should return 404 Not Found if User ID is not a student in the Course" do
    get api_backups_url(@cs61a.id, @ants_cs61a.id, @bob.id)
    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "User ID #{@bob.id} not a student in course ID #{@cs61a.id}", response_json["error"]
  end
end
