class CreateAssignments < ActiveRecord::Migration[8.0]
  def change
    create_table :assignments do |t|
      t.string :name
      t.date :due_date
      t.string :okpy_endpoint

      # Creates column course_id
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end
    add_index :assignments, [:name, :course_id], unique: true
  end
end
