# 2800_202410_BBY32 - The Carbon Cap

COMP2800 Projects course.
The overarching theme of our project course was to envision and create an application with a lasting impact that would extend beyond the next 30 years, within a utopian context. With the global challenge surrounding climate change and the need for sustainability in mind, our aim was to develop an app capable of detecting, consolidating, and displaying essential data concerning users' household energy consumption, financial implications, and the associated carbon footprint.

The design anticipates future scenarios, such as, but not limited to: 
- Widespread usage of EVs
- Aging societies
- Advanced household technologies (ie. appliances, lifts, etc.)

The current implementation does not consider how these assumptions would impact the use of our app. Things we could be adding to show consideration to the assumptions of the future could include:
- Additional devices or appliances reflective of what houses in the future may have (assistive lift technologies for the elderly)
- Changes in the efficiency of devices (perhaps new devices in the future are many times more efficient)
- Electricity generation in the future may be skewed to be more green than now, lowering emissions.


# About Us

Team Name: BBY-32, The Carbon Cap

Team Members:
- Calvin Lee
- Brian Diep
- Anna Dao
- Ethan Nguyen


# Technologies Used
## For coding:
- HTML / CSS / JavaScript
- Node.js
- - Express
- - Express-session
- - Nodemailer
- - Joi
- - Bcrypt
- - Googleapis
- - Mongodb
- - Connect-mongo
- - Dotenv
- - Ejs
- Bootstrap 5.3
- MongoDB
- EJS (Embedded JavaScript)
- Render
- ChatGPT / Copilot


## For planning:
- Figma (whiteboard, wireframes)
- Trello (Agile, sprint/task planning)
- Canva (wireframes, prototype mockups, icon designs)


# For potential developers/contributors:
To contribute to this project, the following software are recommmended:
- Visual Studio Code (especially utilizing various extensions for linting in a variety of languages)
- Studio 3T (recommended to connect and work with the database directly)

API keys are required for some functions, email the repo owner if they are needed.

For the various packages or modules required for this project, run the 'npm i' command in the root folder, assuming Node is installed on the machine. 

A link to the current list of completed and outstanding tests left for the project can be found here:
https://docs.google.com/spreadsheets/d/11GhRIyhW4OLQlTk19WfL_bwTugK26kNnxu6ZDfKUw9g/edit#gid=0


# Working features in the app that can be tested by users
- Signup/login/forgot password submission
- Graphical summary and breakdowns in the main and dashboard pages, broken down by devices the user has added
- Manage device page, allowing add/edit/remove device functions to manage a user's tracked devices
- Profile page, with some functionality for changing user id/name/password/email.
- About us page, with some background information for the app/group


# AI
AI was used to generate useful functions or other functions in which it would be trivial for us to write in order to same time.
AI was also used to write some difficult functions that none of us knew how to tackle.
A list of possible devices that the user can add was created partly by AI by asking it to generate a blank template JSON file with names and empty fields for us to fill in.
The app itself does not interact with AI.


# Contact
For any questions related to this app, email the repo owner (Calvin) at calvinnleeee@gmail.com.

# References:
Canada Energy Regulator - Provincial and Territorial Energy Profiles – British Columbia
https://www.cer-rec.gc.ca/en/data-analysis/energy-markets/provincial-territorial-energy-profiles/provincial-territorial-energy-profiles-british-columbia.html

Statistics Canada - Household energy consumption
https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2510006001

BC Hydro - Electricity rates
https://app.bchydro.com/accounts-billing/rates-energy-use/electricity-rates/residential-rates.html

BC Hydro - Energy concepts, explained
https://www.bchydro.com/powersmart/residential/energy-explained.html

US EPA - Greenhouse gas equivalences calculator
https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator#results

Saskatoon Light & Power - Appliance Usage Chart
https://www.saskatoon.ca/sites/default/files/documents/asset-financial-management/corporate-revenue/services-payments/utilities/appliance_chart-june24-850am.pdf

Daft Logic - List of Power Consumption of Typical Household Appliances
https://www.daftlogic.com/information-appliance-power-consumption.htm


# Credits
- Lead and supporting instructors of COMP2800
- Our project manager / client, Carly Orr
- ChatGPT for some helpful code templates and solving some difficult problems

## Folder Contents:
Top level of project folder:

├── public                    / Contains public assets: Stylesheets, Images, JavaScript Files, JSON files
├── views                     / Holds view templates and EJS files
├── .gitattributes            / Specifies Git repository attributes
├── .gitignore                / Ignores untracked files for Git
├── index.js                  / Manages user authentication, routing and request handling, and static file serving
├── package-lock.json         / Lockfile for package dependencies
├── package.json              / Defines project configuration and dependencies
└── README.md                 / Project documentation
