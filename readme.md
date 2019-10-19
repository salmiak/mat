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

## Clone production db to dev db

Start the server and visit http://localhost:8081/cloneProd2Dev

This will drop the content in dev database and replace it with the content in the production database.


## Todo
- Refactor expanding-textarea to it's own component
- Refactor New Recipes list to it's own component
- Rate recipes
- Upload image with recipe
- https://auth0.com/
