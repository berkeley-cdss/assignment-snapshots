# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Delete existing data (order matters due to foreign key constraints)
AssignmentFile.delete_all
Assignment.delete_all
StaffMembership.delete_all
Enrollment.delete_all
Course.delete_all
User.delete_all

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

assignments = [
  {
    name: "Maps",
    due_date: "2025-03-18 23:59:00",
    okpy_endpoint: "maps",
    files: ["utils.py", "abstractions.py", "recommend.py"]
    # course: data c88c
  },
  {
    name: "Lab 0",
    due_date: "2025-01-31 23:59:00",
    okpy_endpoint: "lab00",
    files: ["lab00.py"]
    # course: data c88c
  }
]

# TODO figure out email vs email_hash
students = [
  {
    first_name: "Alice",
    last_name: "Jones",
    email: "010d927c",
    email_hash: "010d927c",
    student_id: 123
  },
  {
    first_name: "Bob",
    last_name: "Dylan",
    email: "fabec26a",
    email_hash: "fabec26a",
    student_id: 456
  },
  {
    first_name: "Charlie",
    last_name: "Brown",
    email: "9614c0e2",
    email_hash: "9614c0e2",
    student_id: 789
  }
]

user_record = User.create!(first_name: user[:first_name], last_name: user[:last_name], email: user[:email], email_hash: user[:email_hash], student_id: user[:student_id])

# loop over courses and create them
courses.each do |course|
  course_record = Course.create!(dept: course[:dept], code: course[:code], name: course[:name], term: course[:term], year: course[:year], okpy_endpoint: course[:okpy_endpoint])

  # create staff membership for user in course
  StaffMembership.create!(user_id: user_record.id, course_id: course_record.id)

  # create enrollments
  students.each do |student|
    student_record = User.create!(first_name: student[:first_name], last_name: student[:last_name], email: student[:email], email_hash: student[:email_hash], student_id: student[:student_id])
    Enrollment.create!(user_id: student_record.id, course_id: course_record.id)
  end

  # create assignments and code files associated with each assignment
  assignments.each do |assignment|
    assignment_record = Assignment.create!(name: assignment[:name], due_date: assignment[:due_date], okpy_endpoint: assignment[:okpy_endpoint], course_id: course_record.id)

    assignment[:files].each do |file_name|
      AssignmentFile.create!(assignment_id: assignment_record.id, file_name: file_name)
    end
  end
end
