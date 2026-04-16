class AddProblemIndexToAssignmentProblems < ActiveRecord::Migration[8.0]
  def change
    add_column :assignment_problems, :problem_index, :integer
  end
end
