class CreateCourses < ActiveRecord::Migration[8.0]
  def change
    create_table :courses do |t|
      t.string :dept, null: false
      t.string :code, null: false
      t.string :name, null: false
      t.integer :term, null: false
      t.integer :year, null: false
      t.string :okpy_endpoint, null: false

      t.timestamps
    end
    add_index :courses, :okpy_endpoint, unique: true
    add_index :courses, [:dept, :code, :name, :term, :year], unique: true
  end
end
