class Api::Debugging::AutograderSpamController < ApplicationController
  def show
    # Validate params
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i
    user_id = params[:user_id].to_i

    num_backups_threshold = params[:num_backups_threshold].presence&.to_i || 5
    time_threshold = params[:time_threshold].presence&.to_i || 5

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

    backups = BackupMetadatum.where(
      course: course.okpy_endpoint,
      assignment: assignment.okpy_endpoint,
      student_email: student.email
    ).order(:created)

    return render json: [] if backups.empty?

    sessions = []
    current_session = nil

    # Threshold for grouping backups into one session
    gap_threshold = time_threshold.minutes

    backups.each do |backup|
      backup_time = Time.zone.parse(backup.created)

      if current_session.nil? || (backup_time - current_session[:end_time] > gap_threshold)
        # Start a new session
        current_session = {
          id: sessions.length + 1,
          start_time: backup_time,
          end_time: backup_time,
          num_backups: 0,
          problems: Set.new
        }
        sessions << current_session
      end

      # Update session metrics
      current_session[:end_time] = backup_time
      current_session[:num_backups] += 1

      # Collect problems from AnalyticsMessage
      if backup.analytics_location
        # Using the join or association if defined, otherwise direct query
        analytics = AnalyticsMessage.find_by(backup_id: backup.backup_id)
        if analytics&.question_display_names
          analytics.question_display_names.each { |p| current_session[:problems].add(p) }
        end
      end
    end

    # Format for JSON output
    rows = sessions.filter_map do |s|
      next unless s[:num_backups] >= num_backups_threshold

      {
        id: s[:id],
        startTimestamp: s[:start_time].iso8601,
        endTimestamp: s[:end_time].iso8601,
        numBackups: s[:num_backups],
        problems: s[:problems].to_a.sort
      }
    end

    render json: rows
  end
end