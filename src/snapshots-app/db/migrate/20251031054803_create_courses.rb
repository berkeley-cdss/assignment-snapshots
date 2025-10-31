class CreateCourses < ActiveRecord::Migration[8.0]
  def change
    create_table :courses do |t|
      t.string :dept
      t.string :code
      t.string :name
      t.integer :term
      t.integer :year
      t.string :okpy_endpoint

      t.timestamps
    end
    add_index :courses, :okpy_endpoint, unique: true
  end
end
