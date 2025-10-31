class CreateOkpyMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :okpy_messages, id: false do |t|
      t.integer :id, primary_key: true
      t.string :type, null: false
      t.string :description, null: false

      t.timestamps
    end
  end
end
