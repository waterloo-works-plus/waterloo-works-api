const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const config = require('./config');

const applicationsRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');

// Connect to db
const dbUrl = process.env.MONGODB_URI ||
  ('mongodb://' + (config.db.authenticate ? config.db.username + ':' +
  config.db.password : '') + '@' + config.db.host + ':' + config.db.port + '/' +
  config.db.name);

mongoose.connect(dbUrl);

const app = express();

// Setup JSON body parser
app.use(bodyParser.json());

// Setup health endpoint
app.get('/', (req, res) => res.send('Hello World!'));

// Setup routes
applicationsRoutes(app);
authRoutes(app);
jobsRoutes(app);

const port = process.env.PORT || config.port;

app.listen(port, () =>
  console.log('Waterloo Works Mobile API listening on port ' +
  port.toString() + '!'));
