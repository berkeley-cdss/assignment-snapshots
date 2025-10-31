# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_24_165659) do
  create_table "assignments", force: :cascade do |t|
    t.string "name"
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "course_id"
  end

  create_table "backup_metadata", primary_key: "backup_id", id: :text, force: :cascade do |t|
    t.text "created", null: false
    t.text "course", null: false
    t.text "assignment", null: false
    t.text "student_email", null: false
    t.integer "is_late", null: false
    t.integer "submitted", null: false
    t.text "autograder_output_location"
    t.text "grading_location"
    t.text "file_contents_location"
    t.text "analytics_location"
    t.text "scoring_location"
    t.text "unlock_location"
  end

  create_table "courses", force: :cascade do |t|
    t.string "course"
    t.string "name"
    t.string "term"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "okpy_messages", force: :cascade do |t|
    t.text "type", null: false
    t.text "description", null: false
  end

  create_table "students", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.integer "student_id"
    t.string "email"
    t.string "email_hash"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "course_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.integer "course_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
