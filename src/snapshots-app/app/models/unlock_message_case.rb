class UnlockMessageCase < ApplicationRecord
  self.primary_key = [ :backup_id, :question_timestamp ]
  belongs_to :backup_metadatum
end
