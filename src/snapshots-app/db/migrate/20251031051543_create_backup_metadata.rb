class CreateBackupMetadata < ActiveRecord::Migration[8.0]
  def change
    create_table :backup_metadata do |t|
      t.timestamps
    end
  end
end
