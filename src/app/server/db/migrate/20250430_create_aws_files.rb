# This file is a dummy database so that rails doesn't error when making an API request
class CreateAwsFiles < ActiveRecord::Migration[8.0]
  def change
    create_table :aws_files do |t|
      t.string :bucket_name
      t.string :object_key
    end
  end
end
