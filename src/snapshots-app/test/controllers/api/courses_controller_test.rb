require "test_helper"

class Api::CoursesControllerTest < ActionDispatch::IntegrationTest
  # Load fixtures
  setup do
    @alice = users(:alice)
    @bob = users(:bob)
    @cs61a = courses(:cs61a)
    @datac88c = courses(:datac88c)
  end

  # Helper to get the correct URL
  def api_courses_show_url(params = {})
    "/api/courses?#{params.to_query}"
  end

  test "should return 200 OK and associated courses taught for a valid email" do
    # Works for Alice
    get api_courses_show_url(email: @alice.email)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @alice.email, response_json["user_email"]
    assert_equal 1, response_json["courses"].size

    course = response_json["courses"][0]
    assert_equal course["id"], @datac88c.id
    assert_equal course["dept"], @datac88c.dept
    assert_equal course["code"], @datac88c.code
    assert_equal course["name"], @datac88c.name
    assert_equal course["term"], @datac88c.term
    assert_equal course["year"], @datac88c.year
    assert_equal course["okpy_endpoint"], @datac88c.okpy_endpoint

    # Works for Bob
    get api_courses_show_url(email: @bob.email)

    assert_response :ok

    response_json = JSON.parse(@response.body)

    assert_equal @bob.email, response_json["user_email"]
    assert_equal 1, response_json["courses"].size

    course = response_json["courses"][0]
    assert_equal course["id"], @cs61a.id
    assert_equal course["dept"], @cs61a.dept
    assert_equal course["code"], @cs61a.code
    assert_equal course["name"], @cs61a.name
    assert_equal course["term"], @cs61a.term
    assert_equal course["year"], @cs61a.year
    assert_equal course["okpy_endpoint"], @cs61a.okpy_endpoint
  end

  test "should return 404 not found when user email is not found" do
    non_existent_email = "nonexistent@example.com"
    get api_courses_show_url(email: non_existent_email)

    assert_response :not_found

    response_json = JSON.parse(@response.body)
    assert_equal "User email #{non_existent_email} not found", response_json["error"]
  end

  test "should return 400 bad_request when user email is missing" do
    get api_courses_show_url()

    assert_response :bad_request

    response_json = JSON.parse(@response.body)
    assert_equal "User email must be provided as query parameter", response_json["error"]
  end
end
