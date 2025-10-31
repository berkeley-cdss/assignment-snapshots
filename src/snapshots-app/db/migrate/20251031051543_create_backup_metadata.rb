class CreateBackupMetadata < ActiveRecord::Migration[8.0]
  def change
    create_table :backup_metadata, id: false do |t|
      t.string :backup_id, primary_key: true
      t.string :created, null: false
      t.string :course, null: false
      t.string :assignment, null: false
      t.string :student_email, null: false
      t.boolean :is_late, null: false
      t.boolean :submitted, null: false

      t.string :autograder_output_location
      t.string :grading_location
      t.string :file_contents_location
      t.string :analytics_location
      t.string :scoring_location
      t.string :unlock_location

      t.timestamps
    end
    add_index :backup_metadata, :autograder_output_location, unique: true
    add_index :backup_metadata, :grading_location, unique: true
    add_index :backup_metadata, :file_contents_location, unique: true
    add_index :backup_metadata, :analytics_location, unique: true
    add_index :backup_metadata, :scoring_location, unique: true
    add_index :backup_metadata, :unlock_location, unique: true
  end
end
