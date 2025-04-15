const CrudService = require('./../CrudService');
const patient = require('../../models/patientSchema');
const moment = require('moment');  // You can use moment.js or the Date object for date manipulation

class PatientService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data,io, userSockets) {

    const {code,date_of_birth} = data;
    if (!code)
      throw new Error("Patient ID is required");

    // Check if a LabTest with the same code and patient already exists
    const existing = await patient.findOne({
      where: { code:code },
    });
    if (existing) {
      throw new Error("patient code already exists");
    }
    if (date_of_birth) {
      const page = this.calculateAge(date_of_birth);
      data.age = page;  // Add the calculated age to the data before creating the patient
    }
    // Create the new patient
    const newPatient = await super.create(data);

    // Prepare the notification data
    const notificationData = {
      type: 'new_patient',
      patientId: newPatient.id,
      code: newPatient.code,
      name: `${newPatient.firstName || ''} ${newPatient.lastName || ''}`.trim(),
      timestamp: new Date().toISOString(),
      message: `New patient registered: ${newPatient.code}`
    };
    if (io) {
      io.to('doctors_room').emit('new_patient', notificationData);
    }
    return newPatient;
  };
  // Method to calculate age based on date of birth
    calculateAge(date_of_birth) {
      const birthDate = moment(date_of_birth);
      const currentDate = moment();

      const years = currentDate.diff(birthDate, 'years');
      birthDate.add(years, 'years');

      const months = currentDate.diff(birthDate, 'months');
      birthDate.add(months, 'months');

      const weeks = currentDate.diff(birthDate, 'weeks');
      birthDate.add(weeks, 'weeks');

      const days = currentDate.diff(birthDate, 'days');

      const parts = [];

      if (years) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (weeks) parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
      if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

      return parts.length ? parts.join(', ') : '0 days';
    }
}
module.exports=PatientService;