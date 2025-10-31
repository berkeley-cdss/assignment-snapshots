class AddCourseIdToStudents < ActiveRecord::Migration[8.0]
  def change
    add_column :students, :course_id, :integer
  end
end
