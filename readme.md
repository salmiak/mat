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
- Refactor expanding-textarea to it's own component
- Refactor New Recipes list to it's own component
- Upload image with recipe
- Recalculate score on recipe
- Order recipe list on score, name or last made
- Loading state
