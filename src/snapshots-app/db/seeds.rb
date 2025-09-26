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
Course.delete_all

courses = [
  {
    :course => "CS 61A",
    :name => "Structure and Interpretation of Computer Programs",
    :term => "Fall 2025"
  },
  {
    :course => "DATA C88C",
    :name => "Computational Structures in Data Science",
    :term => "Spring 2025"
  },
  {
    :course => "CS 61B",
    :name => "Data Structures",
    :term => "Fall 2023"
  },
]

courses.each do |course|
  Course.create!(
    course: course[:course],
    name: course[:name],
    term: course[:term],
  )
end
