class AddCourseIdToAssignment < ActiveRecord::Migration[8.0]
  def change
    add_column :assignments, :course_id, :integer
  end
end
