# README

## Requirements

* [NodeJS v22](https://nodejs.org/en/download)
* [Ruby v3.3.0](https://rvm.io/)

```sh
nvm use 22
rvm use 3.3.0
```

## Installation

```sh
# install ruby on rails dependencies
bundle install

# install node js dependencies
npm install

# needed to run startup script
brew install overmind
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
rake

# Run brakeman (scan for common Rails vulnerabilities)
brakeman

# Run Ruby linter and autocorrect violations
rubocop --autocorrect

# Run Prettier (formats HTML/CSS/JS files) and autocorrect violations
npx prettier client/ --write
```

## Directory Structure

This is a [React on Rails](https://www.shakacode.com/react-on-rails/docs/) app. The Rails part (backend) is under the `app/` directory and the React frontend is under the `client/` directory.

## AWS S3 Configuration and Authentication

[S3](https://aws.amazon.com/s3/) is used to store assignment snapshot files. To access S3, you will need to:

1. Request `PowerUserAccess` through [UC Berkeley's managed AWS instance](https://technology.berkeley.edu/bcloud-aws-central-faq). (You should contact [Lisa Yan](mailto:yanlisa@berkeley.edu) and [Michael Ball](ball@berkeley.edu) to get added properly since you will need access to the correct S3 buckets.)
2. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
3. For local development, [configure logging in with SSO](https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html) with these configuration values and use the `AWSPowerUserAccess` role:
```sh
$ aws configure sso
SSO session name (Recommended): default
SSO start URL [None]: https://ucberkeley.awsapps.com/start/#
SSO region [None]: us-west-2
SSO registration scopes [sso:account:access]: sso:account:access
...
Default client Region [us-west-2]: us-west-2
CLI default output format (json if not specified) [None]: json
Profile name [AWSPowerUserAccess-<omitted>]: default
```
4. Double check your config, it should look similar to this:
```sh
$ cat ~/.aws/config
[default]
login_session = <omitted>
region = us-west-2
sso_session = default
sso_account_id = <omitted>
sso_role_name = AWSPowerUserAccess
output = json
[sso-session default]
sso_start_url = https://ucberkeley.awsapps.com/start/#
sso_region = us-west-2
sso_registration_scopes = sso:account:access
```
5. Run `aws sts get-caller-identity` and verify that the currently logged in user is the one you just configured. If it is not, you will need to modify your AWS configuration (for example, by deleting existing profiles from your `~/.aws/config` file and deleting unnecessary credentials from your `~/.aws/credentials` file, if it exists).
6. Login using the terminal command `aws sso login`. It should prompt you to login through your browser using your CalNet ID.
