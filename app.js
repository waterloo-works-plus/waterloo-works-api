const express = require('express')
const bodyParser = require('body-parser');

const applicationsRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');

const app = express()

// Setup JSON body parser
app.use(bodyParser.json());

// Setup health endpoint
app.get('/', (req, res) => res.send('Hello World!'))

// Setup routes
applicationsRoutes(app);
authRoutes(app);

app.listen(8080, () => console.log('Waterloo Works Mobile API listening on port 3000!'))