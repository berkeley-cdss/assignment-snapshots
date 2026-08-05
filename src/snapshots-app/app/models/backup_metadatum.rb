class BackupMetadatum < ApplicationRecord
  has_one :analytics_message, foreign_key: :backup_id
  has_many :grading_message_questions, foreign_key: :backup_id
  has_many :unlock_message_cases, foreign_key: :backup_id
end
