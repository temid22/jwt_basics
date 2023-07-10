// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Initiate express app
const app = express();

// add json body parser to the app
app.use(bodyParser.json());

// define user data with user password routes, and role if needed
let users = [
  {
    user: 'Admin',
    password: '123',
    admin: true, // define user role
  },
  {
    user: 'Mazvita',
    password: '123',
    routes: ['a', 'b'], // define user routes
  },
  {
    user: 'Megan',
    password: '123',
    routes: ['b', 'c'], // define user routes
  },
  {
    user: 'Kavelo',
    password: '123',
    routes: ['c'], // define user routes
  },
];

// define api endpoints

// login endpoint
app.post('/login', (req, res) => {
  // get user and password from request parameters
  const user = req.body.user;
  const password = req.body.password;

  // define new attempt object to match against user data
  let attempt = { user, password: String(password) };

  let exist = -1; // initialise variable for user's index position in the users array
  // we make it have a value of minus one, because zero will be the starting position on the array

  // iterate users array to find if a user matches the login attempt
  users.forEach((user, index) => {
    if (user.user === attempt.user) {
      exist = index; // set exist to the index of the existing user
    }
  });

  // if the vale of the exist variable is greater than -1, the user exists,
  // so we check not (!) to catch and incorrect login attempt
  if (!(exist > -1)) {
    res.status(403).send({ error: 'Incorrect login.' });
    return;
  }

  // sign the token
  const token = jwt.sign(JSON.stringify(users[exist]), 'jwt-secret', {
    algorithm: 'HS256',
  });
  res.send({ token });
  return;
});

// resource endpoint
app.get('/resource', (req, res) => {
  console.log(req.headers);
  const authHeader = req.headers['authorization']; // get token from authorization header
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('token', token);
    // here we use a try catch structure to verify the token or catch any errors
    try {
      const decoded = jwt.verify(token, 'jwt-secret');
      res.send({
        msg: `Hello, ${decoded.name}`,
      });
      return;
    } catch (error) {
      res.status(401).send({ error: 'Bad JWT.' });
      return;
    }
  }
});

// admin resource endpoint
app.get('/admin_resource', (req, res) => {
  const authHeader = req.headers['authorization']; // get token from authorization header
  // console.log(token);

  if (authHeader) {
    // try catch structure to verify token
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'jwt-secret');
      if (decoded.admin) {
        // check if the user has the admin role
        res.send({
          msg: `Hello, admin ${decoded.user}`,
        });
        return;
      } else {
        res.status(401).send({ error: 'Unauthorised.' });
        return;
      }
    } catch (error) {
      res.status(401).send({ error: 'Bad JWT.' });
      return;
    }
  }
});

// define user private endpoints
app.get('/a', (req, res) => {
  const authHeader = req.headers['authorization']; // get token from authorization header
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    // console.log(token);
    const decoded = jwt.verify(token, 'jwt-secret'); // verify token
    // console.log(decoded);
    // we set it to true later if we find a matching permission

    let access = false; // define access control variable to false
    // iterate users array
    users.forEach((user) => {
      console.log(user, decoded);
      if (user.user === decoded.user) {
        // matching user
        console.log(user.user, decoded);
        console.log(user.routes, 'user.routes');
        if (user.routes.includes('a')) {
          // matching route access permission
          console.log('access');
          access = true; // here we set access to true if we find the user has access
        }
      }
    });
    // after we iterate the users array, we check if the access variable was set to true

    if (access) {
      res.send({
        msg: `Hello, ${decoded.user}`,
      });
      return;
    } else {
      res.status(401).send({ error: 'Unauthorised.' });
      return;
    }
  } else res.status(500).send({ error: 'Bad jwt' });
});

app.get('/b', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log(token);
    const decoded = jwt.verify(token, 'jwt-secret');
    let access = false;
    // iterate users array
    users.forEach((user) => {
      console.log(user, decoded);
      if (user.user === decoded.user) {
        // matching user
        console.log(user.user, decoded);
        if (user.routes.includes('b')) {
          // matching route access permission
          console.log('access');
          access = true; // set access to true if we find the user has access
        }
      }
    });
    // after we iterate the users array, we check if the access variable was set to true
    if (access) {
      res.send({
        msg: `Hello, ${decoded.user}`,
      });
      return;
    } else {
      res.status(401).send({ error: 'Unauthorised.' });
      return;
    }
  } else res.status(500).send({ error: 'Bad jwt' });
});

app.get('/c', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    console.log(token);
    const decoded = jwt.verify(token, 'jwt-secret');
    let access = false;
    // iterate users array
    users.forEach((user) => {
      console.log(user, decoded);
      if (user.user === decoded.user) {
        // matching user
        console.log(user.user, decoded);
        if (user.routes.includes('c')) {
          // matching route access permission
          console.log('access');
          access = true; // set access to true if we find the user has access
        } else res.status(403).send({ msg: 'Not a User!' });
      }
    });
    // after we iterate the users array, we check if the access variable was set to true
    if (access) {
      res.send({
        msg: `Hello, ${decoded.user}`,
      });
      return;
    } else {
      res.status(401).send({ error: 'Unauthorised.' });
      return;
    }
  } else res.status(500).send({ error: 'Bad jwt' });
});

// start server
app.listen(8000, () => {
  console.log('Listening...');
});
