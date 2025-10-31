class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :email_hash, null: false
      t.integer :student_id, null: false

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :email_hash, unique: true
    add_index :users, :student_id, unique: true
  end
end
