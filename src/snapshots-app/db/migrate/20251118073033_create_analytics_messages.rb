class CreateAnalyticsMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :analytics_messages, id: false do |t|
      t.string :backup_id, primary_key: true
      t.boolean :unlock, null: false
      t.json :question_cli_names
      t.json :question_display_names
      t.json :history, null: false
    end

    add_foreign_key :analytics_messages, :backup_metadata, column: :backup_id, primary_key: :backup_id
  end
end
