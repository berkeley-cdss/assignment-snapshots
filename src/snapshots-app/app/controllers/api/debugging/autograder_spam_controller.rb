class Api::Debugging::AutograderSpamController < ApplicationController
  def show
    # Validate params
    course_id = params[:course_id].to_i
    assignment_id = params[:assignment_id].to_i
    user_id = params[:user_id].to_i

    num_backups_threshold = params[:num_backups_threshold].presence&.to_i || 5
    time_limit_threshold = params[:time_threshold].presence&.to_i || 5

    session_gap_limit = 15.minutes

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

    backups = BackupMetadatum.where(
      course: course.okpy_endpoint,
      assignment: assignment.okpy_endpoint,
      student_email: student.email
    ).order(:created)

    return render json: [] if backups.empty?

    # Group into sessions. Begin a new session if it's > session_gap_limit since the last backup
    sessions = []
    current_session = nil

    backups.each do |backup|
      backup_time = Time.zone.parse(backup.created)

      if current_session.nil? || (backup_time - current_session[:end_time] > session_gap_limit)
        current_session = {
          id: sessions.length + 1,
          start_time: backup_time,
          end_time: backup_time,
          num_backups: 0,
          problems: Set.new
        }
        sessions << current_session
      end

      current_session[:end_time] = backup_time
      current_session[:num_backups] += 1

      if backup.analytics_location
        analytics = AnalyticsMessage.find_by(backup_id: backup.backup_id)
        if analytics&.question_display_names
          analytics.question_display_names.each { |p| current_session[:problems].add(p) }
        end
      end
    end

    rows = sessions.each_with_index.filter_map do |s, index|
      duration_minutes = (s[:end_time] - s[:start_time]) / 1.minute

      # cross multiply to avoid float division and potential divide-by-zero
      is_spam = s[:num_backups] * time_limit_threshold >= num_backups_threshold * duration_minutes
      
      next unless is_spam and s[:num_backups] > 1

      {
        id: index + 1,
        startTimestamp: s[:start_time].iso8601,
        endTimestamp: s[:end_time].iso8601,
        numBackups: s[:num_backups],
        problems: s[:problems].to_a.sort
      }
    end

    render json: rows
  end
end