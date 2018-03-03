const express = require('express')
const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'))

require('./routes/applications')(app);

app.listen(3000, () => console.log('Waterloo Works Mobile API listening on port 3000!'))