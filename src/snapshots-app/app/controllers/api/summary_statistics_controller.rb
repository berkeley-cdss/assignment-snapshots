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
SEC_PER_MIN = 60.0
MIN_PER_HOUR = 60.0
HOUR_PER_DAY = 24.0

class Api::SummaryStatisticsController < ApplicationController
  def get_latest_analytics(course_endpoint, assignment_endpoint)
    BackupMetadatum
      .where(
        course: course_endpoint,
        assignment: assignment_endpoint,
      )
      .group(:student_email)
      .having('created = MAX(created)')
      .joins("INNER JOIN analytics_messages ON analytics_messages.backup_id = backup_metadata.backup_id")
      .select("backup_metadata.*, analytics_messages.*")
  end

  def get_bins(data)
    start = data.min.floor
    last = data.max.ceil
    bin_size = (last - start) / 10

    # TODO: dynamic bin sizing and handle when bin_size = 0

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

  def get_score_distribution(course_endpoint, assignment_endpoint, course, student_email)
    latest_analytics = get_latest_analytics(course_endpoint, assignment_endpoint)

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
  def get_problems_solved_distribution(course_endpoint, assignment_endpoint, student_email)
    latest_analytics = get_latest_analytics(course_endpoint, assignment_endpoint)

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

  def get_number_of_backups_distribution(course_endpoint, assignment_endpoint, student_email)
    num_backups = BackupMetadatum
      .where(
        course: course_endpoint,
        assignment: assignment_endpoint,
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

  def get_total_time_spent_distribution(course_endpoint, assignment_endpoint, student_email)
    timestamps = BackupMetadatum
      .where(
        course: course_endpoint,
        assignment: assignment_endpoint,
      )
      .group(:student_email)
      .select("student_email, unixepoch(MAX(created)) - unixepoch(MIN(created)) as total_time_sec")

    student_time_spent = 0
    data = []

    timestamps.each do |timestamp|
      time_spent_days = (timestamp.total_time_sec / SEC_PER_MIN / MIN_PER_HOUR / HOUR_PER_DAY).round(2)
      data << time_spent_days

      if timestamp.student_email == student_email
        student_time_spent = time_spent_days
      end
    end

    return { "xLabels": get_bins(data), "studentValue": student_time_spent, "data": data }
  end

  def get_active_time_spent_distribution(course_endpoint, assignment_endpoint, student_email)
    threshold = 15 * SEC_PER_MIN

    # calculate time diffs in SQL
    inner_query = BackupMetadatum
      .where(course: course_endpoint, assignment: assignment_endpoint)
      .select(:student_email)
      .select("unixepoch(created) as ts")
      .select("LAG(unixepoch(created)) OVER (PARTITION BY student_email ORDER BY created) as prev_ts")

    # only include diffs under the threshold to filter out inactive time
    results = BackupMetadatum.from("(#{inner_query.to_sql}) as sub")
      .select(:student_email)
      .select("SUM(CASE WHEN ts - prev_ts <= #{threshold} THEN ts - prev_ts ELSE 0 END) as total_sec")
      .group(:student_email)

    # Map the results to hours
    data = []
    student_active_time_spent = nil

    results.each do |row|
      total_min = (row.total_sec / SEC_PER_MIN).round(2)
      data << total_min
      student_active_time_spent = total_min if row.student_email == student_email
    end

    { "xLabels": get_bins(data), "studentValue": student_active_time_spent, "data": data }
  end

  # Total lint errors across all files for the student's latest backup
  def get_lint_errors_distribution(course_endpoint, assignment_endpoint, student_email)
    lint_counts = BackupMetadatum
      .where(course: course_endpoint, assignment: assignment_endpoint)
      .group(:student_email)
      .having('created = MAX(created)')
      # TODO don't hardcode ants.py
      .joins("INNER JOIN lint_errors ON lint_errors.file_contents_location = CONCAT(backup_metadata.file_contents_location, '/ants.py')")
      .select("student_email, COUNT(lint_errors.id) as error_count")

    student_lint_errors = 0
    data = []

    lint_counts.each do |row|
      Rails.logger.info("row: #{row.student_email}, #{row.error_count}")
      count = row.error_count
      data << count

      if row.student_email == student_email
        student_lint_errors = count
      end
    end

    # Handle case where students have 0 lint errors (they won't appear in the INNER JOIN)
    # We fetch total unique students for this assignment to fill in the zeros
    total_students = BackupMetadatum.where(course: course_endpoint, assignment: assignment_endpoint)
                                    .distinct.count(:student_email)

    zeros_to_add = total_students - data.length
    zeros_to_add.times { data << 0 }

    return {
      "xLabels": get_bins(data),
      "studentValue": student_lint_errors,
      "data": data
    }
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
      "score_distribution": get_score_distribution(course.okpy_endpoint, assignment.okpy_endpoint, user_id, student.email),
      "problems_solved_distribution": get_problems_solved_distribution(course.okpy_endpoint, assignment.okpy_endpoint, student.email),
      "number_of_backups_distribution": get_number_of_backups_distribution(course.okpy_endpoint, assignment.okpy_endpoint, student.email),
      "total_time_spent_distribution": get_total_time_spent_distribution(course.okpy_endpoint, assignment.okpy_endpoint, student.email),
      "active_time_spent_distribution": get_active_time_spent_distribution(course.okpy_endpoint, assignment.okpy_endpoint, student.email),
      "lint_errors_distribution": get_lint_errors_distribution(course.okpy_endpoint, assignment.okpy_endpoint, student.email)
    }, status: :ok
  end
end
