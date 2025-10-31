class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :email_hash
      t.integer :student_id

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :email_hash, unique: true
    add_index :users, :student_id, unique: true
  end
end
