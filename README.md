[![Build Status](https://travis-ci.org/waterloo-works-plus/waterloo-works-api.svg?branch=master)](https://travis-ci.org/waterloo-works-plus/waterloo-works-api)

# Waterloo Works API
*Not affilliated with the University of Waterloo*

The Waterloo Works API provides access to applications, interviews and jobs in Waterloo Works. It does this by logging into Waterloo Works on behalf of the user using [Puppeteer](https://github.com/GoogleChrome/puppeteer), a headless browser for Node.js, navigating to the appropriate page and parsing the data on the page. MongoDB is used to cache jobs for faster loading. It does not store or remember any user information.

## Getting Started
### Dependencies
- [Node.js v7.6+](https://nodejs.org/en/)

### Installation
```
$ npm install
```

### Start
```
$ npm start
```

### Test
```
$ npm test
```

## API
All API calls have been added to a [postman collection](postman/Waterloo%20Works%20Mobile%20API.postman_collection.json).

**POST `/auth/login`**

Validates the user's credentials.

#### Body
```
username: String required the username
password: String required the password
```

#### Return
```
status: 'OK' | 'Error' the status of the request
message?: String the error message
```

**POST `/application/get`**

Gets the user's applications for a specific term.

#### Body
```
username: String required the username
password: String required the password
selectedTerm: String optional the term to which to get applications, defaults to the current job search term
```

#### Return
```
status: 'OK' | 'Error' the status of the request
jobIds: [String] an array of job ids the user applied to
jobs: {...} map of the jobs
```
Look at [applicationsLib](lib/applicationsLib.js) to get a better idea of the return value.

**POST `/jobs/get`**

Get a job that the user applied to.
#### Body
```
username: String required the username
password: String required the password
selectedTerm: String required the term to which to get applications, defaults to the current job search term
jobId: String required the job id
```
#### Return
```
status: 'OK' | 'Error' the status of the request
job: { ... } the job
```
Look at [jobsLib](lib/jobsLib.js) to get a better idea of the return value.

**POST `/jobs/db/get`**

Get a job from the database if it exists.
#### Body
```
jobId: String required the job id
```
#### Return
```
status: 'OK' | 'Error' the status of the request
job: { ... } the job
```
Look at [jobsLib](lib/jobsLib.js) to get a better idea of the return value.

**POST `/interviews/get`**

Get a user's interviews.
#### Body
```
username: String required the username
password: String required the password
numOfDays: Number optional the number of days to get interviews for, defaults to -1 which is all
```
#### Return
```
status: 'OK' | 'Error' the status of the request
interviewIds: [String] the interview ids
interviews: {...} map of the interviews
```
Look at [interviewsLib](lib/interviewsLib.js) to get a better idea of the return value.

**POST `/interviews/get-interview`**

Get interview details for a user's interview.
#### Body
```
username: String required the username
password: String required the password
interviewId: String required the interview id
```
#### Return
```
status: 'OK' | 'Error' the status of the request
interview: {...} map of the interview details
```
Look at [interviewsLib](lib/interviewsLib.js) to get a better idea of the return value.
