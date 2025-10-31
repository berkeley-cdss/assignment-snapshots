class CreateEnrollments < ActiveRecord::Migration[8.0]
  def change
    create_table :enrollments do |t|
      t.timestamps
    end
  end
end
