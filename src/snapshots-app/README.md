# README

## Requirements

* NodeJS v22
* Ruby v3.3.0

## Installation

```sh
# install ruby on rails dependencies
bundle install

# install node js dependencies
npm install
```

## Startup

```sh
./bin/dev # For HMR (hot module reloading)
# or
./bin/dev static # Without HMR, statically creating the bundles
```

Visit [http://localhost:3000](http://localhost:3000) and see your React On Rails app running!

To quit the server press `Ctrl + C`. You may need to do this twice (not sure why).

## Common Commands

```sh
# Run tests
bin/rake

# Run brakeman (scan for common Rails vulnerabilities)
bin/brakeman

# Run Ruby linter and autocorrect violations
rubocop --autocorrect

# Run Prettier (formats HTML/CSS/JS files) and autocorrect violations
prettier . --write
```

## Directory Structure

This is a [React on Rails](https://www.shakacode.com/react-on-rails/docs/) app. The Rails part (backend) is under the `app/` directory and the React frontend is under the `client/` directory.

## AWS S3 Configuration and Authentication

S3 is used to store assignment snapshot files. To access S3, you will need to:

1. Request `PowerUserAccess` through [UC Berkeley's managed AWS instance](https://technology.berkeley.edu/bcloud-aws-central-faq). (You should contact [Lisa Yan](mailto:yanlisa@berkeley.edu) and [Michael Ball](ball@berkeley.edu) to get added properly since you will need access to the correct S3 buckets.)
2. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
3. For local development, [configure logging in with SSO](https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html). Make sure to use the following values:
```
sso_start_url = https://ucberkeley.awsapps.com/start/#
sso_region = us-west-2
sso_registration_scopes = sso:account:access
```
4. Login using the terminal command `aws sso login`. It should prompt you to login through your browser using your CalNet ID.
5. If the login is a success, you should see that your `~/.aws/config` file has been updated with new `profile` and `sso-session` sections.
6. Run `aws sts get-caller-identity` and verify that the currently logged in user is the one you just configured. If it is not, you will need to modify your AWS configuration (for example, by deleting existing profiles from your `~/.aws/config` file and deleting unnecessary credentials from your `~/.aws/credentials` file, if it exists).
