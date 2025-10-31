# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Delete all existing data
User.delete_all
Student.delete_all
Course.delete_all
Assignment.delete_all

user = {
  first_name: "Rebecca",
  last_name: "Dang",
  email: "rdang@berkeley.edu"
}

# everything except email_hash is fake
students = [
  {
    first_name: "Alice",
    last_name: "Jones",
    student_id: 1,
    email: "ajones@berkeley.edu",
    email_hash: "010d927c",
  },
  {
    first_name: "Bob",
    last_name: "Smith",
    student_id: 2,
    email: "bsmith@berkeley.edu",
    email_hash: "9614c0e2",
  },
  {
    first_name: "Charlie",
    last_name: "Brown",
    student_id: 3,
    email: "cbrown@berkeley.edu",
    email_hash: "fabec26a",
  },
]

courses = [
  {
    course: "CS 61A",
    name: "Structure and Interpretation of Computer Programs",
    term: "Fall 2025"
  },
  {
    course: "DATA C88C",
    name: "Computational Structures in Data Science",
    term: "Spring 2025"
  },
  {
    course: "CS 61B",
    name: "Data Structures",
    term: "Fall 2023"
  }
]

assignments = [
  {
    name: "Lab 0",
    due_date: "2025-01-20"
  },
  {
    name: "Maps",
    due_date: "2025-02-15"
  }
]

courses.each do |course|
  course_record = Course.create!(
    course: course[:course],
    name: course[:name],
    term: course[:term],
  )

  if course[:course] == "DATA C88C"
    students.each do |student|
      Student.create!(
        first_name: student[:first_name],
        last_name: student[:last_name],
        student_id: student[:student_id],
        email: student[:email],
        email_hash: student[:email_hash],
        course_id: course_record.id,
      )
    end
  end

  # TODO use postgres to have array of course ids instead?
  User.create!(
    first_name: user[:first_name],
    last_name: user[:last_name],
    email: user[:email],
    course_id: course_record.id,
  )

  assignments.each do |assignment|
    Assignment.create!(
      name: assignment[:name],
      due_date: assignment[:due_date],
      course_id: course_record.id,
    )
  end
end
