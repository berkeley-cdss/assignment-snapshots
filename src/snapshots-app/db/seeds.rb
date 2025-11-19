# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

require 'faker'

Faker::Config.random = Random.new(42)

# Delete existing data (order matters due to foreign key constraints)
AssignmentProblem.delete_all
AssignmentFile.delete_all
Assignment.delete_all
StaffMembership.delete_all
Enrollment.delete_all
Course.delete_all
User.delete_all

user = {
  first_name: "Oski",
  last_name: "Bear",
  email: "oski@berkeley.edu",
  email_hash: "abc123",
  student_id: 3030000000
}

courses = [
  # {
  #   dept: "DATA",
  #   code: "C88C",
  #   name: "Computational Structures in Data Science",
  #   term: 1, # spring
  #   year: 2025,
  #   okpy_endpoint: "cal/cs88/sp25"
  # }
  {
    dept: "CS",
    code: "61A",
    name: "Structure and Interpretation of Computer Programs",
    term: 3, # fall
    year: 2025,
    okpy_endpoint: "cal/cs61a/fa25"
  }
]

assignments = [
  # {
  #   name: "Maps",
  #   due_date: "2025-03-18 23:59:00",
  #   okpy_endpoint: "maps",
  #   files: [ "utils.py", "abstractions.py", "recommend.py" ],
  #   problems: [
  #               "Problem 0 Utils",
  #               "Problem 1",
  #               "Problem 2",
  #               "Problem 3",
  #               "Problem 4",
  #               "Problem 5",
  #               "Problem 6",
  #               "Problem 7",
  #               "Problem 8",
  #               "Problem 9",
  #               "Problem 10"
  #           ]
  #   # course: data c88c
  # },
  # {
  #   name: "Lab 0",
  #   due_date: "2025-01-31 23:59:00",
  #   okpy_endpoint: "lab00",
  #   files: [ "lab00.py" ],
  #   problems: [
  #               "Python Basics",
  #               "twenty_twenty_five"
  #           ]
  #   # course: data c88c
  # }
  {
    name: "Ants",
    due_date: "2025-10-23 23:59:00",
    okpy_endpoint: "ants",
    files: [ "ants.py" ],
    problems: [
                "Problem 1",
                "Problem 2",
                "Problem 3",
                "Problem 4",
                "Problem 5",
                "Problem 6",
                "Problem 7",
                "Problem 8a",
                "Problem 8b",
                "Problem 8c",
                "Problem 9",
                "Problem 10",
                "Problem 11",
                "Problem 12",
            ]
    # course: cs 61a
  },
]

cs61a_hashes = [
  "58a8a808",
  "c71d6456",
  "efb1a47d",
  "ceb1d039",
  "914da4aa",
  "2bd5306a",
  "ff8a7b8d",
  "ab96e782",
  "a29adbd5",
  "537ab9c4",
  "9c092a35",
  "90cfed97",
  "620ee0eb",
  "483b88d6",
]

# TODO figure out email vs email_hash
students = [
  # {
  #   first_name: "Alice",
  #   last_name: "Jones",
  #   email: "010d927c",
  #   email_hash: "010d927c",
  #   student_id: 123
  # },
  # {
  #   first_name: "Bob",
  #   last_name: "Dylan",
  #   email: "fabec26a",
  #   email_hash: "fabec26a",
  #   student_id: 456
  # },
  # {
  #   first_name: "Charlie",
  #   last_name: "Brown",
  #   email: "9614c0e2",
  #   email_hash: "9614c0e2",
  #   student_id: 789
  # }
]

def create_fake_student(hash)
  {
    first_name: Faker::Name.unique.first_name,
    last_name: Faker::Name.unique.last_name,
    email: hash,
    email_hash: hash,
    student_id: Faker::IdNumber.unique.valid
  }
end

cs61a_hashes.each do |hash|
  students << create_fake_student(hash)
end

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

    assignment[:problems].each do |problem_name|
      AssignmentProblem.create!(assignment_id: assignment_record.id, display_name: problem_name)
    end
  end
end
