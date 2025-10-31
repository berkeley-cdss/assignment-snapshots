require "test_helper"

class Api::AssignmentsControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @cs61a = courses(:cs61a)
    @datac88c = courses(:datac88c)
    @ants_cs61a = assignments(:ants_cs61a)
    @lab00_cs61a = assignments(:lab00_cs61a)
    @maps_datac88c = assignments(:maps_datac88c)
  end

  # Helper to generate the URL with the course_id parameter
  def api_assignments_show_url(course_id)
    "/api/assignments/#{course_id}"
  end

  test "should return 200 OK and associated assignments for a valid course ID" do
    # Works for CS 61A
    get api_assignments_show_url(@cs61a.id)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @cs61a.id, response_json["course_id"]

    # Check that the assignments array contains the correct number of items
    assignments_data = response_json["assignments"]
    assert_equal 2, assignments_data.size

    # Check that the assignments array contains the correct values
    assignments_data.each do |assignment|
      case assignment["id"]
      when @ants_cs61a.id
        assert_equal @ants_cs61a.name, assignment["name"]
        assert_equal @ants_cs61a.due_date.to_s, assignment["due_date"]
        assert_equal @ants_cs61a.okpy_endpoint, assignment["okpy_endpoint"]
      when @lab00_cs61a.id
        assert_equal @lab00_cs61a.name, assignment["name"]
        assert_equal @lab00_cs61a.due_date.to_s, assignment["due_date"]
        assert_equal @lab00_cs61a.okpy_endpoint, assignment["okpy_endpoint"]
      else
        flunk "Unexpected assignment ID #{assignment['id']} found in response"
      end
    end

    # Works for Data C88C
    get api_assignments_show_url(@datac88c.id)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @datac88c.id, response_json["course_id"]

    # Check that the assignments array contains the correct number of items
    assignments_data = response_json["assignments"]
    assert_equal 1, assignments_data.size

    # Check that the assignments array contains the correct values
    assignment = assignments_data[0]
    assert_equal @maps_datac88c.id, assignment["id"]
    assert_equal @maps_datac88c.name, assignment["name"]
    assert_equal @maps_datac88c.due_date.to_s, assignment["due_date"]
    assert_equal @maps_datac88c.okpy_endpoint, assignment["okpy_endpoint"]
  end

  test "should return 404 not found when course ID is not found" do
    non_existent_id = 99999999

    get api_assignments_show_url(non_existent_id)

    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "Course ID #{non_existent_id} not found", response_json["error"]
  end
end
