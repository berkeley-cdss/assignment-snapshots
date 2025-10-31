require "test_helper"

class Api::SubmissionsControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @cs61a = courses(:cs61a)
    @datac88c = courses(:datac88c)
    @ants_cs61a = assignments(:ants_cs61a)
    @lab00_cs61a = assignments(:lab00_cs61a)
    @maps_datac88c = assignments(:maps_datac88c)
    @alice = users(:alice)
    @bob = users(:bob)
  end

  # Helper to generate the URL with parameters
  def api_submissions_url(course_id, assignment_id)
    "/api/submissions/#{course_id}/#{assignment_id}"
  end

  test "should return 200 OK and list of students who submitted" do
    # Works for Ants assignment in CS61A
    get api_submissions_url(@cs61a.id, @ants_cs61a.id)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @cs61a.id, response_json["course_id"]
    assert_equal @ants_cs61a.id, response_json["assignment_id"]

    submissions = response_json["submissions"]
    # Even though Alice has 2 submissions/backups, she should only appear once in the list
    assert_equal 1, submissions.size

    # Check that the student who submitted (Alice) is present
    submission = submissions[0]
    assert_equal @alice.id, submission["id"]
    assert_equal @alice.first_name, submission["first_name"]
    assert_equal @alice.last_name, submission["last_name"]
    assert_equal @alice.email, submission["email"]
    assert_equal @alice.email_hash, submission["email_hash"]

    # Works for Maps assignment in Data C88C
    get api_submissions_url(@datac88c.id, @maps_datac88c.id)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @datac88c.id, response_json["course_id"]
    assert_equal @maps_datac88c.id, response_json["assignment_id"]

    submissions = response_json["submissions"]
    # Only Bob has submitted for this assignment
    assert_equal 1, submissions.size

    # Check that the student who submitted (Bob) is present
    submission = submissions[0]
    assert_equal @bob.id, submission["id"]
    assert_equal @bob.first_name, submission["first_name"]
    assert_equal @bob.last_name, submission["last_name"]
    assert_equal @bob.email, submission["email"]
    assert_equal @bob.email_hash, submission["email_hash"]
  end

  test "should return 200 OK with an empty array if no submissions were found" do
    get api_submissions_url(@cs61a.id, @lab00_cs61a.id)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @cs61a.id, response_json["course_id"]
    assert_equal @lab00_cs61a.id, response_json["assignment_id"]
    assert_equal [], response_json["submissions"]
  end

  test "should return 404 not found when course ID is invalid" do
    non_existent_id = 99999999

    get api_submissions_url(non_existent_id, @ants_cs61a.id)

    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Course ID #{non_existent_id} not found", response_json["error"]
  end

  test "should return 404 not found when assignment ID is not found for the course" do
    non_existent_id = 88888888

    get api_submissions_url(@cs61a.id, non_existent_id)

    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Assignment ID #{non_existent_id} not found within course ID #{@cs61a.id}", response_json["error"]
  end

  test "should return 404 not found when assignment belongs to a different course" do
    get api_submissions_url(@cs61a.id, @maps_datac88c.id)

    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Assignment ID #{@maps_datac88c.id} not found within course ID #{@cs61a.id}", response_json["error"]
  end
end
