class BackupMetadatum < ApplicationRecord
  has_one :analytics_message
  has_many :grading_message_questions
end
