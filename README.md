# Slash Command and Dialogs blueprint

> :sparkles: *Updated October 2018: As we have introduced some new features, this tutorial and the code samples have been updated! All the changes from the previous version of this example, read the DIFF.md*

## Creating a helpdesk ticket using a Slash Command and a Dialog

Use a slash command and a dialog to create a helpdesk ticket in a 3rd-party system. Once it has been created, send a message to the user with information about their ticket.

![helpdesk-dialog](https://user-images.githubusercontent.com/700173/30929774-5fe9f0e2-a374-11e7-958e-0d8c362f89a3.gif)

## Setup

### Create a Slack app

1. Create an app at [https://api.slack.com/apps](https://api.slack.com/apps)
2. Add a Slash command (See *Add a Slash Command* section below)
3. Navigate to **Bot Users** and click "Add a Bot User" to create one.
4. Enable Interactive components (See *Enable Interactive Components* below)
5. Navigate to the **OAuth & Permissions** page and make sure the following scopes are pre-selected:
    * `commands`
    * `bot`
6. Click 'Save Changes' and install the app (You should get an OAuth access token after the installation)

#### Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/helpdesk`
    * Request URL: Your server or Glitch URL + `/command`
    * Short description: `Create a helpdesk ticket`
    * Usage hint: `[the problem you're having]`

If you did "Remix" on Glitch, it auto-generate a new URL with two random words, so your Request URL should be like: `https://fancy-feast.glitch.me/command`.


#### Enable Interactive Components
1. Go back to the app settings and click on Interactive Components.
1. Set the Request URL to your server or Glitch URL + `/interactive`.
1. Save the change.


### Set Your Credentials

1. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your bot token, `xoxb-` (available on the **OAuth & Permissions** once you install the app)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
2. If you're running the app locally, run the app (`npm start`). Or if you're using Glitch, it automatically starts the app.

#### Run the app

1. Get the code
    * Clone this repo and run `npm install`
2. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your bot token, `xoxb-` (available on the **OAuth & Permissions** once you install the app)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
3. If you're running the app locally, run the app (`npm start`).

If you want to run it locally, I recommend creating a localhost tunnel with [ngrok](https://ngrok.com)!

#### SMG-Specific info

* [Original starter template](https://github.com/slackapi/template-slash-command-and-dialogs)
* Dependencies:
    * npm install xmlhttprequest (it's not native to Node)
* Repo note: .env is gitignored, so don't destroy the server version, or you'll have to recreate it
* Server notes:
    * Node/npm is a weird version on the server. Had to manually copy node_modules from my local up to the server
    * Also had to update node version to 10.15 using nvm and by specifying in .nvmrc
    * Apache gets in the way, so after setting up the site on the server, add the following into the config file for the server (/etc/apache2/sites-enabled/[site-name].conf):
        `ProxyRequests on
        ProxyPass / http://localhost:[node-port]/`
        * **Make sure that mod_proxy is enabled!**
        * The node port is set in .env and/or index.js
    * Gotta run the server persistently in the background! Here's the command to do so:
          `node [path-to-index.js] > stdout.txt 2> stderr.txt &`
      What it does:
          * `node [path-to-index.js]` tells the app to serve, using index.js
          * `> stdout.txt 2> stderr.txt` redirects console.log and error output to text files, preventing the server from crashing when it tries to route those messages to the terminal (since there won't be a terminal there, once you exit)
          * `&` tells the process to run persistently in the background
