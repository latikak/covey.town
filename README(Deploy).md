Deploy our frontend to Netlify. Netlify will create an optimized production build of your frontend (by running npm run build) and host it in their globally-distributed content delivery network.

Create a free account on Netlify. We suggest signing up with GitHub.
After logging in, select “Create a new site from git”, and then select “GitHub” as your git provider. Follow the prompts to connect Netlify with GitHub, and then choose the account/organization that has your Covey.Town fork and select the repository. Leave “branch to deploy” as “master”. Set the build command to: CI= npm run-script build and publish directory to build. Click deploy site.
Click on “Site Settings” and then select “Build & deploy” from the left-hand sidebar. Click on “Edit settings” in the first section (“Build settings”). Change base directory to frontend. Your settings shoudl now look like this:


Scroll down on this same settings page to “Environment”. This is where we define the .env variables that Netlify should use (without needing to put .env in a publicly viewable place). Click “Edit variables” and add a single variable: REACT_APP_TOWNS_SERVICE_URL should be set to your heroku server name (https://yourapp-name.herokuapp.com, find in heroku “settings” page for your app).
Netlify will take several minutes to build your site. From the “Deploys” view of Netlify’s control panel, you can see the status of each build. Once you have a successful build, it will show a URL where your site is published (something like https://mystifying-beaver-b51dd2.netlify.app).
