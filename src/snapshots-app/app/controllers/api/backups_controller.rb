# TODO update tests

class Api::BackupsController < ApplicationController
  def show
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

    assignment_file_names = AssignmentFile.where(assignment_id: assignment_id).map { |af| af.file_name }
    assignment_problem_names = AssignmentProblem.where(assignment_id: assignment_id).map { |ap| ap.display_name }
    backup_metadata = BackupMetadatum.where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint, student_email: student.email).order(:created)
    backups = backup_metadata.filter_map do |backup|
      if backup.unlock_location.nil? and backup.grading_location.nil?
        nil
      else
        analytics = AnalyticsMessage.find(backup.backup_id)

        grading_message_questions = if backup.grading_location.nil?
          nil
        else
          GradingMessageQuestion.where(backup_id: backup.backup_id).order(:question_display_name)
        end

        unlock_message_cases = if backup.unlock_location.nil?
          nil
        else
          UnlockMessageCase.where(backup_id: backup.backup_id).order(:question_timestamp)
        end

        {
          backup_id: backup.backup_id,
          created: backup.created,
          file_contents_location: backup.file_contents_location,
          autograder_output_location: backup.autograder_output_location,
          unlock: analytics.unlock,
          question_cli_names: analytics.question_cli_names,
          question_display_names: analytics.question_display_names,
          history: analytics.history.sort_by { |h| h["display_name"] },
          grading_message_questions: grading_message_questions,
          unlock_message_cases: unlock_message_cases
        }
      end
    end

    render json: { "course_id": course_id, "assignment_id": assignment_id, "user_id": user_id, "assignment_file_names": assignment_file_names, "assignment_problem_names": assignment_problem_names, "backups": backups }, status: :ok
  end
end
