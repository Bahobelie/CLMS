const CrudService = require('./../CrudService');

class emergencyHealthInfoService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const { patientid, code } = data;
    if (!patientid) throw new Error("Patient ID is required");

    const existingLabTest = await this.model.findOne({
      where: { code, patientid },
    });

    if (existingLabTest) {
      throw new Error("LabTest with the same patient ID and code already exists");
    }

    return super.create(data);
  }
}

module.exports = emergencyHealthInfoService;