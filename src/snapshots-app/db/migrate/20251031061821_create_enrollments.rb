class CreateEnrollments < ActiveRecord::Migration[8.0]
  def change
    create_table :enrollments do |t|
      # Creates column user_id
      t.references :user, null: false, foreign_key: true

      # Creates column course_id
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end
    add_index :enrollments, [:user_id, :course_id], unique: true
  end
end
