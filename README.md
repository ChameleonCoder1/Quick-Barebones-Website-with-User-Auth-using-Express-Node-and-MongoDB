# Quick-Starter-Code-for-Website-with-User-Auth-and-CRUD-API-using-Express-Node-and-MongoDB


This is code that I use to get started on web development projects.

With this code, you will have a functioning web server with open routes to create/read/update/delete users
as well as functioning user authentication and error/success middleware delivered through flash. The original
purpose for this code (and the way it is currently set up) was to have the website act as an API to the database which allowed for:

    - companies UPDATE their data
    - me to CREATE/DELETE a companies data as needed
    - end users READ data via a mobile app

As such, the website itself has a "secret" route (a route not linked to on any of the website's other
webpages) for me to CREATE/DELETE companies. Note: If this is not desired, you
can easily link to the create route (get request to /add/company/new) on any webpage.

It has "non-secret" routes for company log-in/UPDATING their data.

And it has a READ route that reads all user's data and converts it to json format for reading by a (separate, not
included in this code base) react native app.

Of course, you may not want this particular functionality and if you
have trouble tailoring it to your project or any other specific questions, feel free to contact Nick at gameheel19@gmail.com.

As for database schemas, there are two: Company and Post. The Company schema has username, password, and
a 1-to-1 object reference to an associate post for that company. The Post schema has the company's city,
location, thumbnail image, and url, and the 1-to-1 object reference to the associated company for that post.

I've included explanatory comments before most chunks of code.



To run, you will need to have Node JS (https://nodejs.org/en/download/)
and MongoDB installed (https://www.mongodb.com/download-center/community).
Installing MongoDB is optional here and there is hard-coded data in
server.js that is commented out and can be uncommented in place of a database.

Then, simply go clone this full repository to your local machine, navigate to the
folder in your command line and run:
npm install

This will install express and all other node dependencies listed in package.json.



Good luck and happy coding. Below I've included more about the routes.



READ Route:

    - get request to: /api/read


CREATE Route:

    - get request to: /add/company/new
        - renders new.ejs, the form to create a new user
    - post request to: /add/company/new
        - creates new company and associates empty post data with that company

UPDATE Route:

    - get request to: /update/:id (company id)
        - renders edit.ejs which shows a logged-in company their information and give them ability to update
    - post request to: /update/:id (company id)
        - updates any data that the company changed via edit.ejs

DELETE Route:
    - delete request to: /company/:id




Login Route
    - get request to: /login
        - renders login.ejs, the form to login for a company
    - post request to: /login
        - logs a company in and redirects to home page
    - get request to: /logout
        - logs a company out and redirects to home page
