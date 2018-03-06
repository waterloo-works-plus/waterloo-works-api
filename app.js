const express = require('express')
const bodyParser = require('body-parser');
const port = 8080;
const applicationsRoutes = require('./routes/applications');
const interviewsRoutes = require('./routes/interviews');
const authRoutes = require('./routes/auth');

const app = express()

// Setup JSON body parser
app.use(bodyParser.json());

// Setup health endpoint
app.get('/', (req, res) => res.send('Hello World!'))

// Setup routes
applicationsRoutes(app);
interviewsRoutes(app);
authRoutes(app);

app.listen(port, () => console.log('Waterloo Works Mobile API listening on port ' + port.toString()));