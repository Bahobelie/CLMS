const CrudService = require('./../CrudService');

class AppointmentService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const { patientId, code } = data;
    if (!patientId) throw new Error("Patient ID is required");

    const existing = await this.model.findOne({
      where: { code },
    });

    if (existing) {
      throw new Error("Appointment already exists");
    }

    return super.create(data);
  }
}

module.exports = AppointmentService;