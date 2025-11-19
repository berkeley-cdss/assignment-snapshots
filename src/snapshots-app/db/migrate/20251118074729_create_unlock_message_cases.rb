class CreateUnlockMessageCases < ActiveRecord::Migration[8.0]
  def change
    create_table :unlock_message_cases, id: false do |t|
      t.string :backup_id, null: false
      t.boolean :correct, null: false
      t.string :prompt, null: false
      t.json :student_answer, null: false
      t.json :printed_msg, null: false
      t.string :case_id, null: false
      t.string :question_timestamp, null: false
      t.string :answer_timestamp, null: false
    end

    add_foreign_key :unlock_message_cases, :backup_metadata, column: :backup_id, primary_key: :backup_id
  end
end
