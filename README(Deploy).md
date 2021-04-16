The link to our code: https://github.com/latikak/covey.town


Deploy the backend rooms service to Heroku.
This way, you can have a publicly available version of our backend service, which will automatically update with any changes that you push to Git. 

1. Go to Heroku.com and create an account, or sign in if you already have one

2. After signing in, create a new app. Choose a name for your app that is somewhat descriptive - it will become part of the URL that you’ll use to access the service. Click “Create app” (no need to go through “Add to pipeline…”)

3. After creating your app on Heroku, open the app’s settings page, revealing a page that looks like this: 
![image](https://user-images.githubusercontent.com/41226737/114953674-ddad4c80-9e26-11eb-91cc-e377e5698ba3.png)

4. Click “Reveal Config Vars”, and enter the 4 twilio configuration variables from your .env file. Heroku’s “Config Vars” are the way that we tell Heroku what variables to use for .env without having to commit that file into the (publicly viewable) repository. Your configuration settings on Heroku should look like this now: 
![image](https://user-images.githubusercontent.com/41226737/114953711-f453a380-9e26-11eb-9a64-43577c815015.png)

Before navigating away from this settings page, scroll down to “Domains”, and take note of the address that Heroku has provided for your app. This should say something like “Your app can be found at https://covey-deployment-example.herokuapp.com/”.

To confirm that your service is successfully deployed, try to visit it in your browser. Use the URL that you noted in step 5 (“Your app can be found at https://covey-deployment-example.herokuapp.com/”). Append towns to the URl, and visit it in your browser (e.g. https://covey-deployment-example.herokuapp.com/towns). After a short delay, you should see the response {"isOK":true,"response":{"towns":[]}}.


Deploy our frontend to Netlify. Netlify will create an optimized production build of your frontend (by running npm run build) and host it in their globally-distributed content delivery network.

Create a free account on Netlify. We suggest signing up with GitHub.
After logging in, select “Create a new site from git”, and then select “GitHub” as your git provider. Follow the prompts to connect Netlify with GitHub, and then choose the account/organization that has your Covey.Town fork and select the repository. Leave “branch to deploy” as “master”. Set the build command to: CI= npm run-script build and publish directory to build. Click deploy site.
Click on “Site Settings” and then select “Build & deploy” from the left-hand sidebar. Click on “Edit settings” in the first section (“Build settings”). Change base directory to frontend. Your settings shoudl now look like this:

![image](https://user-images.githubusercontent.com/41226737/114952903-43003e00-9e25-11eb-8bc0-6dfdf6095ca1.png)



Scroll down on this same settings page to “Environment”. This is where we define the .env variables that Netlify should use (without needing to put .env in a publicly viewable place). Click “Edit variables” and add a single variable: REACT_APP_TOWNS_SERVICE_URL should be set to your heroku server name (https://yourapp-name.herokuapp.com, find in heroku “settings” page for your app).
Netlify will take several minutes to build your site. From the “Deploys” view of Netlify’s control panel, you can see the status of each build. Once you have a successful build, it will show a URL where your site is published (something like https://mystifying-beaver-b51dd2.netlify.app).
