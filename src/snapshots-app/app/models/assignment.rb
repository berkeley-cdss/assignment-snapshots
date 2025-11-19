class Assignment < ApplicationRecord
  validates :name, uniqueness: { scope: :course_id,
                                 message: "An assignment with this name already exists for this course." }
  belongs_to :course
  has_many :assignment_files
  has_many :assignment_problems
end
