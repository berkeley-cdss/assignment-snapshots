class BackupFileMetadatum < ApplicationRecord
  self.primary_key = [ :file_contents_location, :file_name ]
end
