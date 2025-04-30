Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # TODO namespace the routes, e.g. prefix with /api?

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get "/files/:okpy_endpoint/:assignment/:student_id/:backup_id/:file_name", to: "files#show", constraints: { file_name: /.+\..+/ }
end
