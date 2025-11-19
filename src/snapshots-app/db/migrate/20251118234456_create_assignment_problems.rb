class CreateAssignmentProblems < ActiveRecord::Migration[8.0]
  def change
    create_table :assignment_problems do |t|
      t.references :assignment, null: false, foreign_key: true
      t.string :display_name, null: false
    end
  end
end
