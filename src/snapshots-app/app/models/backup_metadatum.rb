class BackupMetadatum < ApplicationRecord
  has_one :analytics_message
  has_many :grading_message_questions
  has_many :unlock_message_cases
end
