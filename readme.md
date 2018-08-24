# Beckmans Matplanering

## Setup

You need to install [node.js](https://nodejs.org/en/)

To deploy you need to have [AWS-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html) installed and configured. [Follow these instructions on setting up AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials)

### Client
**Run dev:** `npm run start`

**Deploy:** `npm run deploy`

### Server
**Run dev:** `npm run start`

**Deploy**
Hosted on AWS serverless you need to install serverless (`npm install -g serverless`).

To deploy, in the Server directory, run

`npm run deploy`


## Todo
- Add touch events
- Add Facebook login: https://saml-doc.okta.com/IdentityProvider_Docs/Facebook_Identity_Provider_Setup.html
- Refactor expanding-textarea to it's own component
- Refactor New Recipes list to it's own component
- Handle non auth calls to open login

## Auth alternatives to look at https://medium.com/@michaljurkowski/how-to-make-basic-authentication-in-vue-js-using-google-firebase-e3ec7dad274
https://www.djamware.com/post/5ac8338780aca714d19d5b9e/securing-mevn-stack-vuejs-2-web-application-using-passport
