class Course < ApplicationRecord
  enum :term, { winter: 0, spring: 1, summer: 2, fall: 3 }
  validates :dept, uniqueness: { scope: [ :code, :name, :term, :year ],
                                 message: "A course with this exact department, code, name, term, and year already exists." }
  has_many :assignments

  has_many :enrollments
  has_many :students, through: :enrollments, source: :user

  has_many :staff_memberships
  has_many :staff_members, through: :staff_memberships, source: :user
end
