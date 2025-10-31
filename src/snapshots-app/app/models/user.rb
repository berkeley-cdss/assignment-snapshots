class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true
  validates :email_hash, presence: true, uniqueness: true
  validates :student_id, presence: true, uniqueness: true
end
