class Course < ApplicationRecord
  enum :term, { winter: 0, spring: 1, summer: 2, fall: 3 }
end
