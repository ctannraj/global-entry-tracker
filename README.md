# Install nvm, npm and node, manage node installations with nvm.
> brew install npm\
> brew install nvm\
> nvm install node\
> nvm ls\
> nvm alias default node

# Install node modules
> cd <PROJECT_ROOT>/\
> npm install

# Make a copy of config/config.js.template
  > cp config/config.js.template config/config.js

  ## alertType
    - type of alert to receive, supported values ['EMAIL', 'SMS', 'POPUP_ALERT']    
  ## locationId
    - choose the locationId to monitor [docs/all_locations.json]
    - NOTE: use locationId:5001 for testing.
  ## email.auth: using gmail's app password
    - enable MFA and generate app password [https://support.google.com/mail/answer/185833?hl=en]
  ## sms: using sinch for sending messages, they support a free-tier
    - API Key & Secrets are needed [https://www.sinch.com/]

# Execute, check for slots
## Run the task only once
> cd <PROJECT_ROOT>/
> node ./app/globalEntryTracker.js --schedule=false

## Schedule the task (to run every minute)
> cd <PROJECT_ROOT>/
> node ./app/globalEntryTracker.js --schedule=true
