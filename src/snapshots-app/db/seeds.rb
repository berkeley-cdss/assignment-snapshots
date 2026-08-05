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
  #   term: 3, # fall
  #   year: 2025,
  #   okpy_endpoint: "cal/cs88/fa25"
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

  # CS 61A ants
  {
    name: "Ants",
    due_date: "2025-10-23 23:59:00",
    okpy_endpoint: "ants",
    files: [ "ants.py" ],
    problems: [
      "Problem 0", # only unlocking tests
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
                "Problem 12"
            ]
  }

  # DATA C88C ants
  # {
  #   name: "Ants",
  #   due_date: "2025-11-25 23:59:00",
  #   okpy_endpoint: "ants",
  #   files: [ "ants.py" ],
  #   problems: [
  #               "Problem 0", # only unlocking tests
  #               "Problem 1",
  #               "Problem 2",
  #               "Problem 3",
  #               "Problem 4",
  #               "Problem 5",
  #               "Problem 6",
  #               "Problem 7",
  #               "Problem 8a",
  #               "Problem 8b",
  #               "Problem 8c",
  #               "Problem 9",
  #               "Problem 10",
  #               "Problem 11",
  #               "Problem 12"
  #           ]
  # }
]

# cs61a_hashes = [
#   "58a8a808",
#   "c71d6456",
#   "efb1a47d",
#   "ceb1d039",
#   "914da4aa",
#   "2bd5306a",
#   "ff8a7b8d",
#   "ab96e782",
#   "a29adbd5",
#   "537ab9c4",
#   "9c092a35",
#   "90cfed97",
#   "620ee0eb",
#   "483b88d6"
# ]

cs61a_hashes = [ 'e3384165',
 '1faf1492',
 '0757b4af',
 '5e0b5dff',
 '55d9e0b2',
 '4349b29d',
 '27f16a00',
 '1bcf17a8',
 'bbb281e4',
 '18e36d10',
 'd0d1b4b0',
 '94d2cb91',
 '09e6bcbc',
 '08a08a79',
 '1a3aee97',
 '3ff28b43',
 '4972bef4',
 'a8faf137',
 'd6797b5b',
 'fc1888f1',
 'c2b307c8',
 '395b6a1a',
 'f0cd1289',
 '90cfed97',
 '41a86dbb' ]

# c88c_hashes = [ '7dcfb139', 'cf7b9cab', '88e94290' ]
# c88c_hashes = ['e3384165',
#  '1faf1492',
#  '0757b4af',
#  '5e0b5dff',
#  '55d9e0b2',
#  '4349b29d',
#  '27f16a00',
#  '1bcf17a8',
#  'bbb281e4',
#  '18e36d10',
#  'd0d1b4b0',
#  '94d2cb91',
#  '09e6bcbc',
#  '08a08a79',
#  '1a3aee97',
#  '3ff28b43',
#  '4972bef4',
#  'a8faf137',
#  'd6797b5b',
#  'fc1888f1',
#  'c2b307c8',
#  '395b6a1a',
#  'f0cd1289',
#  '90cfed97',
#  '41a86dbb']
student_email_hashes = cs61a_hashes

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
    student_id: Faker::Number.unique.number(digits: 10)
  }
end

student_email_hashes.each do |hash|
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

    assignment[:problems].each_with_index do |problem_name, index|
      AssignmentProblem.create!(assignment_id: assignment_record.id, display_name: problem_name, problem_index: index)
    end
  end
end
