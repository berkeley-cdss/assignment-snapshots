class CreateStaffMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :staff_memberships do |t|
      t.timestamps
    end
  end
end
