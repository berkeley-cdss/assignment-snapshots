class CreateAssignmentFiles < ActiveRecord::Migration[8.0]
  def change
    create_table :assignment_files do |t|
      t.references :assignment, null: false, foreign_key: true
      t.string :file_name, null: false
    end
  end
end
