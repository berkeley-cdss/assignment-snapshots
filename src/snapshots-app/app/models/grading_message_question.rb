class GradingMessageQuestion < ApplicationRecord
  self.primary_key = [ :backup_id, :question_display_name ]
  belongs_to :backup_metadatum
end
