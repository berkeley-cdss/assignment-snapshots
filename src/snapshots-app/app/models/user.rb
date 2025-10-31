class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true
  validates :email_hash, presence: true, uniqueness: true
  validates :student_id, presence: true, uniqueness: true

  has_many :enrollments
  has_many :enrolled_courses, through: :enrollments, source: :course

  has_many :staff_memberships
  has_many :courses_taught, through: :staff_memberships, source: :course
end
