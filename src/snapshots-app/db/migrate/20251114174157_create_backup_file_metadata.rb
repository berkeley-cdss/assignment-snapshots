class CreateBackupFileMetadata < ActiveRecord::Migration[8.0]
  def change
    create_table :backup_file_metadata, id: false, primary_key: [ :file_contents_location, :file_name ] do |t|
      t.string :file_contents_location, null: false
      t.string :file_name, null: false
      t.integer :num_lines

      t.timestamps
    end
  end
end
