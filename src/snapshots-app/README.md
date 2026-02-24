# README

## Requirements

- NodeJS v22
- Ruby v3.3.0

We recommend installing the above using `nvm` and `rvm`, respectively, to manage your virtual environment.
**Run all commands in the current directory.**

1. [Install NodeJS for your OS using `nvm` with `npm`](https://nodejs.org/en/download) (use the dropdowns to generate the correct terminal commands and then run them)
2. Tell `nvm` you want to use that version now:
```sh
nvm use 22
```
3. Install [`rvm`](https://rvm.io/):
```sh
curl -sSL https://get.rvm.io | bash -s stable
```
4. Install Ruby v3.3.0:
```sh
rvm install 3.3.0
```
> [!WARNING]
> If the command above results in some kind of error related to OpenSSL,
> you can try running the steps under [Troubleshooting](#troubleshooting)
> to fix your installation.
5. Tell `rvm` you want to use that version now:
```sh
rvm use 3.3.0
```

### Troubleshooting

If you are on MacOS and have [OpenSSL](https://www.openssl.org/) installed via [Homebrew](https://brew.sh)
and are running into an error related to those things when running step 3 above, it is likely
because of [this issue](https://stackoverflow.com/questions/77874851/trouble-installing-specific-version-of-ruby-openssl-issue).
Try these commands to fix it:

1. Reinstall OpenSSL v3
```sh
brew install openssl@3
```
2. Clear `rvm`'s cache
```sh
rvm cleanup
```
3. Install Ruby v3.3.0 with the path to the OpenSSL v3 installation:
```sh
rvm install ruby-3.3.0 --with-openssl-dir="$(brew --prefix openssl@3)"
```

## Installation

1. Install frontend dependencies:
```sh
npm install
```
2. Install backend dependencies:
```sh
bundle install
```
1. Install [`overmind`](https://github.com/DarthSim/overmind) which is needed to run the [Usage](#usage) scripts (this assumes you are on MacOS and have already installed [Homebrew](https://brew.sh)):
```sh
brew install overmind
```

## Usage

To preview the web app locally, run either of the following commands (we recommend the first when developing):

```sh
./bin/dev # For HMR (hot module reloading)
# or
./bin/dev static # Without HMR, statically creating the bundles
```

Visit [http://localhost:3000](http://localhost:3000) and see your React On Rails app running on your local development server!

To quit the server press `Ctrl + C`. **You may need to do this twice (not sure why)**.

## Common Development Commands

```sh
# Run unit tests
rake

# Run brakeman (scan for common Rails vulnerabilities)
brakeman

# Run Ruby linter and autocorrect violations
rubocop --autocorrect

# Run Prettier (formats HTML/CSS/JS files) and autocorrect violations
npx prettier client/ --write
```

For more information on these tools, see their documentation:

- [Rake](https://guides.rubyonrails.org/v4.1/command_line.html#rake)
- [Brakeman](https://brakemanscanner.org/docs/)
- [Rubocop](https://docs.rubocop.org/rubocop/index.html)
- [Prettier](https://prettier.io/docs/)

## Directory Structure

This is a [React on Rails](https://www.shakacode.com/react-on-rails/docs/) app. The Rails part (backend) is under the `app/` directory and the React frontend is under the `client/` directory.

## AWS S3 Configuration and Authentication

[S3](https://aws.amazon.com/s3/) is used to store assignment snapshot files. To access S3, you will need to:

1. Request `PowerUserAccess` through [UC Berkeley's managed AWS instance](https://technology.berkeley.edu/bcloud-aws-central-faq). (You should contact [Lisa Yan](mailto:yanlisa@berkeley.edu) and [Michael Ball](ball@berkeley.edu) to get added properly since you will need access to the correct S3 buckets. See also: [internal onboarding docs](https://docs.google.com/document/d/1KhpRW0GYBY-HRSRG8b6z3EbRSFQJaqVPPUsha_puY2I/edit?tab=t.0).)
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
