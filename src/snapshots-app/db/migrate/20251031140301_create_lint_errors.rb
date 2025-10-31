class CreateLintErrors < ActiveRecord::Migration[8.0]
  def change
    create_table :lint_errors do |t|
      t.string :file_contents_location, null: false
      t.integer :line_number, null: false
      t.string :message, null: false
      t.string :code, null: false
      t.string :url

      t.timestamps
    end
    add_index :lint_errors, [ :file_contents_location, :line_number, :message, :code ], unique: true
  end
end
