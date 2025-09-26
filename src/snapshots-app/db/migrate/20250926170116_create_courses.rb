class CreateCourses < ActiveRecord::Migration[8.0]
  def change
    create_table :courses do |t|
      t.string :course
      t.string :name
      t.string :term

      t.timestamps
    end
  end
end
