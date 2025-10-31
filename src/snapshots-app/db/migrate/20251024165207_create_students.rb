class CreateStudents < ActiveRecord::Migration[8.0]
  def change
    create_table :students do |t|
      t.string :first_name
      t.string :last_name
      t.integer :student_id
      t.string :email
      t.string :email_hash

      t.timestamps
    end
  end
end
