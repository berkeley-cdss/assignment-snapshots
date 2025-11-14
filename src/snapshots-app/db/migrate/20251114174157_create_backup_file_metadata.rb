class CreateBackupFileMetadata < ActiveRecord::Migration[8.0]
  def change
    create_table :backup_file_metadata do |t|
      t.integer :num_lines

      t.timestamps
    end
  end
end
