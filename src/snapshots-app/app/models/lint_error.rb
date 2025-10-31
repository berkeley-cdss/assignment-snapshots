class LintError < ApplicationRecord
  self.primary_key = [ :file_contents_location, :line_number, :message, :code ]
end
