class CreateAssignments < ActiveRecord::Migration[8.0]
  def change
    create_table :assignments do |t|
      t.string :name
      t.date :due_date
      t.integer :course_id
      t.string :okpy_endpoint

      t.timestamps
    end
  end
end
