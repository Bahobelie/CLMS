const CrudService = require('./../CrudService');
const patient = require('../../models/patientSchema');
const moment = require('moment');

class PatientService extends CrudService {
  constructor(model, io) {
    super(model);
    this.io = io;
  }

  async create(data) {
    const { code, date_of_birth,application_fee_amount } = data;
    if (!code) throw new Error("Patient ID is required");

    const existing = await patient.findOne({ where: { code } });
    if (existing) throw new Error("Patient code already exists");

    const now = new Date();
    data.created_at = now;
    data.updated_at = now;

    const newPatient = await super.create(data);
    this.sendDoctorNotification(newPatient, 'created');
    return newPatient;
  }

  async update(id, updateData) {  // Add updateData parameter
    const existingPatient = await patient.findOne({ where: { id } });
    if (!existingPatient) {
      throw new Error("Patient does not exist");
    }

    // // Calculate age if date_of_birth is being updated
    // if (updateData.date_of_birth) {
    //   updateData.age = this.calculateAge(updateData.date_of_birth);
    // }

    const updatedPatient = await super.update(id, updateData);  // Pass updateData

    // Determine changed fields for notification
    const changedFields = Object.keys(updateData).filter(
      key => existingPatient[key] !== updatedPatient[key]
    );

    this.sendDoctorNotification(updatedPatient, 'updated', changedFields);
    return updatedPatient;
  }

  sendDoctorNotification(patient, action, changedFields = []) {
    if (!this.io) return;

    const message = action === 'created'
      ? `New patient registered: ${patient.first_name || ''} ${patient.last_name || ''}`
      : `Patient updated (${changedFields.join(', ')}): ${patient.first_name || ''} ${patient.last_name || ''}`;

    this.io.to('doctor').emit('doctor_notification', {
      id: Date.now(),
      title: action === 'created' ? 'New Patient Created' : 'Patient Data Updated',
      message,
      type: 'message',
      timestamp: new Date().toISOString(),
      role: 'doctor',
      patientId: patient.id,
      changes: changedFields
    });
  }

  async bulkCreate(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error("Bulk data must be a non-empty array");
    }

    for (const item of dataArray) {
      const existing = await this.model.findOne({ where: { code: item.code } });
      if (existing) {
        throw new Error(`Patient code '${item.code}' already exists`);
      }

    }
    // All validations passed — proceed with bulk create
    return this.model.bulkCreate(dataArray);
  }
}

module.exports = PatientService;