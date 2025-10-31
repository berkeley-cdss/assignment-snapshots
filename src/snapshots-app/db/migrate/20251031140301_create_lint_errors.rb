class CreateLintErrors < ActiveRecord::Migration[8.0]
  def change
    create_table :lint_errors do |t|
      t.string :file_contents_location
      t.integer :line_number
      t.string :message
      t.string :code
      t.string :url

      t.timestamps
    end
  end
end
