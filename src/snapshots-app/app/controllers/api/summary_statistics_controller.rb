# TODO unit tests

# TODO don't hardcode this
# based on DATA C88C FA25 Ants
SCORING = {
  "Problem 0" => 0,
  "Problem 1" => 2,
  "Problem 2" => 2,
  "Problem 3" => 4,
  "Problem 4" => 4,
  "Problem 5" => 6,
  "Problem 6" => 2,
  "Problem 7" => 6,
  "Problem 8a" => 2,
  "Problem 8b" => 2,
  "Problem 8c" => 2,
  "Problem 9" => 4,
  "Problem 10" => 2,
  "Problem 11" => 4,
  "Problem 12" => 4,
}

class Api::SummaryStatisticsController < ApplicationController
  def get_latest_analytics(course_id, assignment_id)
    BackupMetadatum
      .where(
        course: Course.find(course_id).okpy_endpoint,
        assignment: Assignment.find(assignment_id).okpy_endpoint,
      )
      .group(:student_email)
      .having('MAX(created)')
      .joins("INNER JOIN analytics_messages ON analytics_messages.backup_id = backup_metadata.backup_id")
      .select("backup_metadata.*, analytics_messages.*")
  end

  def get_bins(data)
    start = data.min
    last = data.max
    bin_size = (last - start) / 10

    bins = []
    current = start

    while current < last
      if current + bin_size > last
        bins << "#{current}+"
      else
        bins << "#{current}-#{current + bin_size}"
      end

      current += bin_size
    end

    return bins
  end

  def get_score_distribution(course_id, assignment_id, user_id, course, student_email)
    latest_analytics = get_latest_analytics(course_id, assignment_id)

    student_score = 0
    data = []

    latest_analytics.each do |backup|
      score = 0

      JSON.parse(backup.history).each do |question|
        if question["solved"]
          score += SCORING[question["display_name"]]
        end
      end

      if backup.student_email == student_email
        student_score = score
      end

      data << score
    end

    return { "xLabels": get_bins(data), "studentValue": student_score, "data": data }
  end

  # TODO make this more DRY (a lot of repeated code from previous method)
  def get_problems_solved_distribution(course_id, assignment_id, user_id, course, student_email)
    latest_analytics = get_latest_analytics(course_id, assignment_id)

    student_solved = 0
    data = []

    latest_analytics.each do |backup|
      solved = 0

      JSON.parse(backup.history).each do |question|
        if question["solved"]
          solved += 1
        end
      end

      if backup.student_email == student_email
        student_solved = solved
      end

      data << solved
    end

    return { "xLabels": get_bins(data), "studentValue": student_solved, "data": data }
  end

  def get_number_of_backups_distribution(course_id, assignment_id, user_id, student_email)
    num_backups = BackupMetadatum
      .where(
        course: Course.find(course_id).okpy_endpoint,
        assignment: Assignment.find(assignment_id).okpy_endpoint,
      )
      .group(:student_email)
      .select("student_email, COUNT(*) as num_backups")

    student_num_backups = 0
    data = []

    num_backups.each do |backup|
      data << backup.num_backups

      if backup.student_email == student_email
        student_num_backups = backup.num_backups
      end
    end

    return { "xLabels": get_bins(data), "studentValue": student_num_backups, "data": data }
  end

  def get_total_time_spent_distribution(course_id, assignment_id, user_id)
    # TODO implement
    return {}
  end

  def get_active_time_spent_distribution(course_id, assignment_id, user_id)
    # TODO implement
    return {}
  end

  def get_lint_errors_distribution(course_id, assignment_id, user_id)
    # TODO implement
    return {}
  end

  def show
    # Validate params
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i
    user_id = params[:user_id].to_i

    course = Course.find_by(id: course_id)
    if course.nil?
      render json: { "error": "Course ID #{course_id} not found" }, status: :not_found
      return
    end

    assignment = course.assignments.find_by(id: assignment_id)
    if assignment.nil?
      render json: { "error": "Assignment ID #{assignment_id} not found within course ID #{course_id}" }, status: :not_found
      return
    end

    student = course.students.find_by(id: user_id)
    if student.nil?
      render json: { "error": "User ID #{user_id} not a student in course ID #{course_id}" }, status: :not_found
      return
    end

    # TODO error if student doesn't have any backups for this assignment and course

    render json: {
      "course_id": course_id,
      "assignment_id": assignment_id,
      "user_id": user_id,
      "score_distribution": get_score_distribution(course_id, assignment_id, user_id, course, student.email),
      "problems_solved_distribution": get_problems_solved_distribution(course_id, assignment_id, user_id, course, student.email),
      "number_of_backups_distribution": get_number_of_backups_distribution(course_id, assignment_id, user_id, student.email),
      "total_time_spent_distribution": get_total_time_spent_distribution(course_id, assignment_id, user_id),
      "active_time_spent_distribution": get_active_time_spent_distribution(course_id, assignment_id, user_id),
      "lint_errors_distribution": get_lint_errors_distribution(course_id, assignment_id, user_id)
    }, status: :ok
  end
end
