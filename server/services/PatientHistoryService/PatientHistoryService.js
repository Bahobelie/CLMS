const CrudService = require('./../CrudService');

class PatientHistoryService extends CrudService{
  constructor(model) {
    super(model);
  }
  async create(data) {
    const { patientId ,code} = data;
    if (!patientId)
      throw new Error("Patient ID is required");

// Check if a LabTest with the same code  already exists
    const existingLabTest = await this.model.findOne({
      where: { code },
    });
    if (existingLabTest) {
      throw new Error("history with code already exists");
    }
    return super.create(data);
  };
}
module.exports = PatientHistoryService;