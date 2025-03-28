const CrudService = require('./../CrudService');

class PrescriptionService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { patientId } = data;
    if (!patientId)
      throw new Error("Patient ID is required");

    return super.create(data);
  };
}
module.exports=PrescriptionService;