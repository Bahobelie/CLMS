const CrudService = require('./../CrudService');

class PrescriptionService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { patientId ,code} = data;
    if (!patientId)
      throw new Error("Patient ID is required");

    const existingLabTest = await this.model.findOne({
      where: { code },
    });
    if (existingLabTest) {
      throw new Error("Prescription code already exists");
    }
    return super.create(data);
  };
}
module.exports=PrescriptionService;