# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Delete existing data
User.delete_all
Course.delete_all
StaffMembership.delete_all

user = {
  first_name: "Rebecca",
  last_name: "Dang",
  email: "rdang@berkeley.edu",
  email_hash: "abc123",
  student_id: 3037279631
}

courses = [
  {
    dept: "DATA",
    code: "C88C",
    name: "Computational Structures in Data Science",
    term: 1, # spring
    year: 2025,
    okpy_endpoint: "cal/cs88/sp25"
  }
]

user_record = User.create!(first_name: user[:first_name], last_name: user[:last_name], email: user[:email], email_hash: user[:email_hash], student_id: user[:student_id])

# loop over courses and create them
courses.each do |course|
  course_record = Course.create!(dept: course[:dept], code: course[:code], name: course[:name], term: course[:term], year: course[:year], okpy_endpoint: course[:okpy_endpoint])

  # create staff membership for user in course
  StaffMembership.create!(user_id: user_record.id, course_id: course_record.id)
end
