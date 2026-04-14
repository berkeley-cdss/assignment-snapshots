require 'active_support/time'

class Api::ProblemTimelineController < ApplicationController
  SESSION_TIME_GAP_THRESHOLD = 15.minutes

  # color blind color palette from https://davidmathlogic.com/colorblind/#%23D81B60-%231E88E5-%23FFC107-%23004D40
  PINK = "#D81B60"
  BLUE = "#1E88E5"
  YELLOW = "#FFC107"
  DARK_GREEN = "#004D40"

  def get_grading_backup_status(grading_message_question)
    if grading_message_question.failed == 0
      { :label => "Correctness Tests Passed", :color => DARK_GREEN }
    else
      { :label => "Correctness Tests Failed", :color => PINK }
    end
  end

  # This works assuming that the unlock_message_cases are all belonging to the same problem
  def get_unlocking_backup_status(unlock_message_cases)
    if unlock_message_cases.map { |umc| umc.correct }.all?
      { :label => "Unlocking Tests Passed", :color => BLUE }
    else
      { :label => "Unlocking Tests Failed", :color => YELLOW }
    end
  end

  def get_problem_to_backups(backups, problem_names)
    # problem name to array of hashes where each hash represents relevant data from a single backup
    # hash has: timestamp, label, color
    result = problem_names.map { |name| [name, []] }.to_h

    backups.each do |backup|
      Rails.logger.info("backup #{backup}")
      if backup.grading_location.present?
        backup.grading_message_questions.each do |gmq|
          status = get_grading_backup_status(gmq)
          result[gmq.question_display_name] << { :timestamp => Time.iso8601(backup.created) }.merge(status)
        end
      end

      if backup.unlock_location.present?
        # annoyingly, unlock.json doesn't have question display name so we fetch it from analytics.json
        backup_problem_names = backup.analytics_message.question_display_names
        umc_grouped_by_problem_name = backup_problem_names.map { |name| [name, []] }.to_h
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

        umc_grouped_by_problem_name.each do |name, unlock_message_cases|
          status = get_unlocking_backup_status(unlock_message_cases)
          result[name] << { :timestamp => Time.iso8601(backup.created) }.merge(status)
        end
      end
    end

    result
  end

  # This works assuming the array contains backups for the same problem
  def get_sessions(backups)
    # A session is defined as a series of backups where:
    # 1. Consecutive timestamps are <= SESSION_TIME_GAP_THRESHOLD, and
    # 2. All labels (and therefore colors) are the same within the session

    result = []
    curr_session =
      {
        startTime: backups[0][:timestamp],
        endTime: backups[0][:timestamp],
        label: backups[0][:label],
        color: backups[0][:color],
        numBackups: 1,
      }

    backups.each_cons(2) do |a, b|
      has_time_gap = b[:timestamp] - a[:timestamp] > SESSION_TIME_GAP_THRESHOLD
      labels_differ = a[:label] != b[:label]

      if has_time_gap or labels_differ
        result << curr_session
        curr_session =
      {
        startTime: b[:timestamp],
        endTime: b[:timestamp],
        label: b[:label],
        color: b[:color],
        numBackups: 1,
      }
      else
        curr_session[:endTime] = b[:timestamp]
        curr_session[:numBackups] += 1
      end
    end

    result << curr_session
    result
  end

  def get_problem_to_sessions(problem_to_backups)
    # then have helper function to turn each array into sessions (use threshold)
    # compute startTime and endTime, color
    problem_to_backups.map { |name, backups| [name, get_sessions(backups)] }.to_h
  end

  def get_timeline_data(problem_to_sessions, problem_name_to_index)
    # then flatten all arrays and assign problemIndex using problem_name_to_index hash
    # also combine label with numBackups into single label
    result = []

    problem_to_sessions.map do |problem_name, sessions|
      problem_index = problem_name_to_index[problem_name]
      sessions.each do |session|
        result << {
        problemIndex: problem_index,
        startTime: session[:startTime],
      endTime: session[:endTime],
      label: "#{session[:label]} (#{session[:numBackups]} backup#{session[:numBackups] > 1 ? 's' : ''})",
      color: session[:color]
      }
      end
    end

    result
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

    problem_to_backups = get_problem_to_backups(backups, problem_name_to_index.keys)
    problem_to_sessions = get_problem_to_sessions(problem_to_backups)
    timeline_data = get_timeline_data(problem_to_sessions, problem_name_to_index)

    render json: timeline_data, status: :ok
  end
end
