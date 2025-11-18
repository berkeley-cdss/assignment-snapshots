class CreateGradingMessageQuestions < ActiveRecord::Migration[8.0]
  def change
    create_table :grading_message_questions, id: false, primary_key: [ :backup_id, :question_display_name ] do |t|
      t.string :backup_id, null: false
      t.string :question_display_name, null: false
      t.integer :locked, null: false
      t.integer :passed, null: false
      t.integer :failed, null: false
    end

    add_foreign_key :grading_message_questions, :backup_metadata, column: :backup_id, primary_key: :backup_id
  end
end
