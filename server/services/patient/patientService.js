const CrudService = require('./../CrudService');
const patient = require('../../models/patientSchema');

class PatientService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    console.log(`data`,data);

    const {code} = data;
    if (!code)
      throw new Error("Patient ID is required");

    // Check if a LabTest with the same code and patientid already exists
    const existing = await patient.findOne({
      where: { code:code },
    });
    if (existing) {
      throw new Error("patient code already exists");
    }

    return super.create(data);
  };
}
module.exports=PatientService;