const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
  },
  lastUpdated: Date,
  postingStatus: String,
  internalStatus: String,
  workTerm: String,
  jobType: String,
  title: String,
  openings: Number,
  category: String,
  level: [String],
  region: String,
  addressLineOne: String,
  addressLineTwo: String,
  city: String,
  provinceOrState: String,
  postalCodeOrZipCode: String,
  country: String,
  workTermDuration: String,
  specialJobRequirements: String,
  summary: String,
  responsibilities: String,
  requiredSkills: String,
  compensationAndBenefitsInformation: String,
  targetedDegreesAndDisciplines: String,
  applicationDeadline: Date,
  organization: String,
  division: String,
});

module.exports = mongoose.model('Job', jobSchema);
