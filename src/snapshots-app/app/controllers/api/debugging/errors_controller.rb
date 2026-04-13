class Api::Debugging::ErrorsController < ApplicationController
  # Python traceback error line usually looks like: "NameError: name 'x' is not defined"
  # This regex captures the Type (before the colon) and the Message (after the colon)
  ERROR_REGEX = /^([a-zA-Z0-9_]+Error):\s*(.*)$/

  def show
    # Standard lookup logic
    course = Course.find_by(id: params[:course_id])
    assignment = course&.assignments&.find_by(id: params[:assignment_id])
    student = course&.students&.find_by(id: params[:user_id])

    if !course || !assignment || !student
      render json: { error: "Context not found" }, status: :not_found
      return
    end

    # Fetch backups that have autograder output
    backups = BackupMetadatum.where(
      course: course.okpy_endpoint,
      assignment: assignment.okpy_endpoint,
      student_email: student.email
    ).where.not(autograder_output_location: nil).order(:created)

    error_data = []
    counter = 1

    backups.each do |backup|
      # In this schema, we assume the autograder output is stored locally or cached
      # Reusing the logic from your PrintStatements controller for consistency
      file_path = Rails.root.join("../../data/private/#{backup.autograder_output_location}")

      next unless File.exist?(file_path)

      output_text = File.read(file_path)

      # Python errors are typically at the very end of the traceback
      # We scan lines from bottom to top to find the actual error definition
      error_type = nil
      error_msg = nil

      output_text.lines.reverse_each do |line|
        if match = line.strip.match(ERROR_REGEX)
          error_type = match[1]
          error_msg = match[2]
          break
        end
      end

      # Only include in response if we actually parsed an error
      if error_type
        error_data << {
          id: counter,
          backupId: backup.backup_id,
          timestamp: backup.created,
          type: error_type,
          message: error_msg
        }
        counter += 1
      end
    end

    render json: error_data
  end
end