Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "login#index"

  # Define API routes in separate namespace
  namespace :api, defaults: { format: :json } do
    get "files", to: "files#show"
    get "courses", to: "courses#show"
    get "assignments/:course_id", to: "assignments#show"
    get "submissions/:course_id/:assignment_id", to: "submissions#show"
    get "backups/:course_id/:assignment_id/:user_id", to: "backups#show"
    get "lint_errors", to: "lint_errors#show"
    get "backup_file_metadatum", to: "backup_file_metadatum#show"
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # # fallback: any HTML request not handled above should render the react SPA (single page application)
  # react-router handles client-side routing
  get "*path", to: "login#index", constraints: ->(req) { req.format.html? }

  # TODO setup nested routes?
  # TODO these routes don't work with react-router client-side routing
  # get "courses" => "courses#index"
  # get "courses/:courseId" => "courses#show", as: :course
  # get "courses/:courseId/assignments/:assignmentId" => "assignments#show", as: :assignment
  # get "courses/:courseId/assignments/:assignmentId/students/:studentId" => "submissions#show", as: :submission
end
