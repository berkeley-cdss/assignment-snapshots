require "active_support/time"

# TODO unit tests
class Api::ProblemTimelineController < ApplicationController
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

      problem_name_to_index = AssignmentProblem.where(assignment_id: assignment.id)
      .pluck(:display_name, :problem_index)
      .to_h

    backups = BackupMetadatum
      .where(
        course: course.okpy_endpoint,
        assignment: assignment.okpy_endpoint,
        student_email: student.email
      )
      .order(:created)

    processed_backups = process_backups(backups, problem_name_to_index)
    sessions = get_sessions(processed_backups)

    render json: sessions, status: :ok
  end

  private

  SESSION_TIME_GAP_THRESHOLD = 15.minutes

  # TODO move this logic into frontend since it's about styling
  # color blind color palette from https://davidmathlogic.com/colorblind/#%23D81B60-%231E88E5-%23FFC107-%23004D40
  PINK = "#D81B60"
  BLUE = "#1E88E5"
  YELLOW = "#FFC107"
  DARK_GREEN = "#004D40"

  def get_grading_backup_status(grading_message_question)
    # TODO separate label into backup type (unlock vs. correctness) and status (passed boolean), then format label in frontend
    if grading_message_question.failed == 0
      { label: "Correctness Tests Passed", color: DARK_GREEN }
    else
      { label: "Correctness Tests Failed", color: PINK }
    end
  end

  # This works assuming that the unlock_message_cases are all belonging to the same problem
  def get_unlocking_backup_status(unlock_message_cases)
    if unlock_message_cases.map { |umc| umc.correct }.all?
      { label: "Unlocking Tests Passed", color: BLUE }
    else
      { label: "Unlocking Tests Failed", color: YELLOW }
    end
  end

  def process_backups(backups, problem_name_to_index)
    # returns an array of hashes where each hash represents relevant data from a single backup
    # hash has: timestamp, label, color, index, problem_name
    result = []

    backups.each_with_index do |backup, index|
      if backup.grading_location.present?
        backup.grading_message_questions.each do |gmq|
          status = get_grading_backup_status(gmq)
          result << { timestamp: Time.iso8601(backup.created), index: index, problem_name: gmq.question_display_name, problem_index: problem_name_to_index[gmq.question_display_name] }.merge(status)
        end
      end

      if backup.unlock_location.present?
        # annoyingly, unlock.json doesn't have question display name so we fetch it from analytics.json
        backup_problem_names = backup.analytics_message.question_display_names
        umc_grouped_by_problem_name = backup_problem_names.map { |name| [ name, [] ] }.to_h
        backup.unlock_message_cases.each do |umc|
          # TODO dangerously (?) assume that unlock message cases
          # will always match exactly one of the backup problem names
          backup_problem_names.each do |name|
            if umc.case_id.start_with?(name)
              umc_grouped_by_problem_name[name] << umc
              break
            end
          end
        end

        umc_grouped_by_problem_name.each do |problem_name, unlock_message_cases|
          status = get_unlocking_backup_status(unlock_message_cases)
          result << { timestamp: Time.iso8601(backup.created), index: index, problem_name: problem_name, problem_index: problem_name_to_index[problem_name] }.merge(status)
        end
      end
    end

    result
  end

  def get_sessions(processed_backups)
    if processed_backups.empty?
      return []
    end

    # A session is defined as a series of backups where:
    # 1. All problems worked on are the same within the session, AND
    # 2. All labels (and therefore colors) are the same within the session, AND
    # 3. Consecutive timestamps are <= SESSION_TIME_GAP_THRESHOLD

    result = []
    # TODO only convert to camel case at the end for consistency. generally fix naming conventions in all files...
    curr_session =
      {
        startTime: processed_backups[0][:timestamp],
        endTime: processed_backups[0][:timestamp],
        label: processed_backups[0][:label],
        color: processed_backups[0][:color],
        startIndex: processed_backups[0][:index],
        endIndex: processed_backups[0][:index] + 1,
        problemName: processed_backups[0][:problem_name],
        problemIndex: processed_backups[0][:problem_index],
      }

    processed_backups.each_cons(2) do |a, b|
      problems_differ = a[:problem_index] != b[:problem_index]
      has_time_gap = b[:timestamp] - a[:timestamp] > SESSION_TIME_GAP_THRESHOLD
      labels_differ = a[:label] != b[:label]

      if problems_differ or has_time_gap or labels_differ
        result << curr_session
        curr_session =
      {
        startTime: b[:timestamp],
        endTime: b[:timestamp],
        label: b[:label],
        color: b[:color],
        startIndex: b[:index],
        endIndex: b[:index] + 1,
        problemName: b[:problem_name],
        problemIndex: b[:problem_index]
      }
      else
        curr_session[:endTime] = b[:timestamp]
        curr_session[:endIndex] = b[:index] + 1
      end
    end

    result << curr_session
    result
  end
end
