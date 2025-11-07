require "aws-sdk-s3"

# TODO update tests, make it faster

S3_BUCKET_NAME = "ucb-assignment-snapshots-eae254943a2c4f51bef67654e99560dd"
S3_BUCKET_REGION = "us-west-2"

class Api::BackupsController < ApplicationController
  def get_s3_object(object_key)
    # uses default credentials for local dev - see src/app/server/README.md to configure using AWS CLI
    s3 = Aws::S3::Client.new(region: S3_BUCKET_REGION)
    Rails.logger.info("Fetching #{object_key} from S3")
    response = s3.get_object(bucket: S3_BUCKET_NAME, key: object_key)
    Rails.logger.info("Successfully fetched #{object_key} from S3")
    response.body.read.force_encoding("UTF-8") # Assuming UTF-8 encoding
  end

  def get_files(file_contents_location, assignment_file_names)
    assignment_file_names.sort.map do |file_name|
      {
        :name => file_name,
        :contents => get_s3_object("#{file_contents_location}/#{file_name}")
      }
    end
  end

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
    backup_metadata = BackupMetadatum.where(course: course.okpy_endpoint, assignment: assignment.okpy_endpoint, student_email: student.email).order(:created)
    backups = backup_metadata.filter_map do |backup|
      if backup.file_contents_location.present? and backup.autograder_output_location.present?
        begin
          files = get_files(backup.file_contents_location, assignment_file_names)
          autograder_output = get_s3_object(backup.autograder_output_location)
          error = nil
        rescue Aws::S3::Errors::NoSuchBucket => e
          error = "#{e.message} S3 bucket: #{e.context.params[:bucket]}"
          status = :not_found
        rescue Aws::S3::Errors::NoSuchKey => e
          error = "#{e.message} S3 object key: #{e.context.params[:key]}"
          status = :not_found
        rescue Aws::S3::Errors::ServiceError => e
          error = "Error accessing S3: #{e.message} Request context params: #{e.context.params}"
          status = :internal_server_error
        rescue StandardError => e
          error = "Unknown error occurred when fetching files from S3: #{e.message} Request context params: #{e.context.params}"
          status = :internal_server_error
        end

        if error
          Rails.logger.error(error)
          render json: { "error": error }, status: status
          return
        end

        {
          backup_id: backup.backup_id,
          created: backup.created,
          course: backup.course,
          assignment: backup.assignment,
          student_id: backup.student_email,
          files: files,
          autograder_output: autograder_output
        }
      else
        nil
      end
    end

    render json: { "course_id": course_id, "assignment_id": assignment_id, "user_id": user_id, "backups": backups }, status: :ok
  end
end
