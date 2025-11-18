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

ActiveRecord::Schema[8.0].define(version: 2025_11_18_074254) do
  create_table "analytics_messages", primary_key: "backup_id", id: :string, force: :cascade do |t|
    t.boolean "unlock", null: false
    t.json "question_cli_names"
    t.json "question_display_names"
    t.json "history", null: false
  end

  create_table "assignment_files", force: :cascade do |t|
    t.integer "assignment_id", null: false
    t.string "file_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assignment_id"], name: "index_assignment_files_on_assignment_id"
  end

  create_table "assignments", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "due_date", null: false
    t.string "okpy_endpoint", null: false
    t.integer "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_assignments_on_course_id"
    t.index ["name", "course_id"], name: "index_assignments_on_name_and_course_id", unique: true
  end

  create_table "backup_file_metadata", id: false, force: :cascade do |t|
    t.string "file_contents_location", null: false
    t.string "file_name", null: false
    t.integer "num_lines"
  end

  create_table "backup_metadata", primary_key: "backup_id", id: :string, force: :cascade do |t|
    t.string "created", null: false
    t.string "course", null: false
    t.string "assignment", null: false
    t.string "student_email", null: false
    t.boolean "is_late", null: false
    t.boolean "submitted", null: false
    t.string "autograder_output_location"
    t.string "grading_location"
    t.string "file_contents_location"
    t.string "analytics_location"
    t.string "scoring_location"
    t.string "unlock_location"
    t.index ["analytics_location"], name: "index_backup_metadata_on_analytics_location", unique: true
    t.index ["autograder_output_location"], name: "index_backup_metadata_on_autograder_output_location", unique: true
    t.index ["file_contents_location"], name: "index_backup_metadata_on_file_contents_location", unique: true
    t.index ["grading_location"], name: "index_backup_metadata_on_grading_location", unique: true
    t.index ["scoring_location"], name: "index_backup_metadata_on_scoring_location", unique: true
    t.index ["unlock_location"], name: "index_backup_metadata_on_unlock_location", unique: true
  end

  create_table "courses", force: :cascade do |t|
    t.string "dept", null: false
    t.string "code", null: false
    t.string "name", null: false
    t.integer "term", null: false
    t.integer "year", null: false
    t.string "okpy_endpoint", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["dept", "code", "name", "term", "year"], name: "index_courses_on_dept_and_code_and_name_and_term_and_year", unique: true
    t.index ["okpy_endpoint"], name: "index_courses_on_okpy_endpoint", unique: true
  end

  create_table "enrollments", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_enrollments_on_course_id"
    t.index ["user_id", "course_id"], name: "index_enrollments_on_user_id_and_course_id", unique: true
    t.index ["user_id"], name: "index_enrollments_on_user_id"
  end

  create_table "grading_message_questions", id: false, force: :cascade do |t|
    t.string "backup_id", null: false
    t.string "question_display_name", null: false
    t.integer "locked", null: false
    t.integer "passed", null: false
    t.integer "failed", null: false
  end

  create_table "lint_errors", id: false, force: :cascade do |t|
    t.string "file_contents_location", null: false
    t.integer "line_number", null: false
    t.string "message", null: false
    t.string "code", null: false
    t.string "url"
  end

  create_table "okpy_messages", force: :cascade do |t|
    t.string "type", null: false
    t.string "description", null: false
  end

  create_table "staff_memberships", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_staff_memberships_on_course_id"
    t.index ["user_id", "course_id"], name: "index_staff_memberships_on_user_id_and_course_id", unique: true
    t.index ["user_id"], name: "index_staff_memberships_on_user_id"
  end

  create_table "tests", force: :cascade do |t|
    t.json "object"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "email_hash", null: false
    t.integer "student_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email_hash"], name: "index_users_on_email_hash", unique: true
    t.index ["student_id"], name: "index_users_on_student_id", unique: true
  end

  add_foreign_key "analytics_messages", "backup_metadata", column: "backup_id", primary_key: "backup_id"
  add_foreign_key "assignment_files", "assignments"
  add_foreign_key "assignments", "courses"
  add_foreign_key "enrollments", "courses"
  add_foreign_key "enrollments", "users"
  add_foreign_key "grading_message_questions", "backup_metadata", column: "backup_id", primary_key: "backup_id"
  add_foreign_key "staff_memberships", "courses"
  add_foreign_key "staff_memberships", "users"
end
