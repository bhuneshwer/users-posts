# Posts App

This app lets you login using your **Github** account. Once you are logged in you can see all the posts by you and other app users.

## Functionalities

 - User can login using their **Github** account
 - User can see all the posts 
 - User can edit their post
 - User can reply on the post
 - Infinite scroll is impleted so user can see old posts by scrolling down
 ## How to run the app
  
  
 - Download/clone the app
 - Open terminal and navigate to root folder of the app
 - run **npm install**
 - execute app by using **npm start** or **node app.js**
 - App will start listening on port 5100
 - Browse http://localhost:5100
 
## Technologies used
 - NodeJS
 - ExpressJS
 - MongoDB
 - Passport JS for Authentication
 - passport-github for Github Authentication

## Database
Database  - MongoDB
Database name - rentmojo-app-db

Collections
 - users
 - posts

Posts

 - _id - Unique identifier of the Post. Mongo ObjectId
 - text - Post text  (String)
 - user_id - Id of the user who posted the comment (Mongo ObjectId)
 - created_date - Date when the post was created (Date)
 - parent_id - Parent Post Id. Parent_id indicates the reply post. (Mongo ObjectId)

Users

 - _id - Unique identifier of the User. (Mongo ObjectId)
 - Users collection conatins github profile data of the user


## App directory stucture
client

 - css - Css dependencies
 - js - Javascript dependencies
 - login.html - Login Page
 - posts.html - Posts Page
 - 404.html

server
 - api - All the apis within their module
 - routes - routing handlers
 - db - db access handlers for all the entities
 - config - config files
 - utils 

scripts 
node_modules
