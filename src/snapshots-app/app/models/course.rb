class Course < ApplicationRecord
  enum :term, { winter: 0, spring: 1, summer: 2, fall: 3 }
  validates :dept, uniqueness: { scope: [:code, :name, :term, :year],
                                 message: "A course with this exact department, code, name, term, and year already exists." }
end
