class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true
  validates :email_hash, presence: true, uniqueness: true
  validates :student_id, presence: true, uniqueness: true

  has_many :enrollments
  has_many :courses, through: :enrollments

  has_many :staff_memberships
  has_many :courses, through: :staff_memberships
end
