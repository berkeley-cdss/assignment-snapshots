class CreateOkpyMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :okpy_messages do |t|
      t.timestamps
    end
  end
end
