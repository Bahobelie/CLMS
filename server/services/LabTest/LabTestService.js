const CrudService = require('./../CrudService');

class LabTestService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { patientid ,code} = data;
    if (!patientid)
      throw new Error("Patient ID is required");

    // Check if a LabTest with the same code and patientid already exists
    const existingLabTest = await this.model.findOne({
      where: { code },
    });
    if (existingLabTest) {
      throw new Error("LabTest with the same patient ID and code already exists");
    }

    return super.create(data);
  };
}
module.exports=LabTestService;