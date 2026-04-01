class CreateLintErrors < ActiveRecord::Migration[8.0]
  def change
    create_table :lint_errors do |t|
      t.string :file_contents_location, null: false
      t.integer :start_location_row, null: false
      t.integer :start_location_col, null: false
      t.integer :end_location_row, null: false
      t.integer :end_location_col, null: false
      t.string :message, null: false
      t.string :code, null: false
      t.string :url
    end
  end
end
