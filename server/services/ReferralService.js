

const CrudService = require('./CrudService');

class ReferralService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { patientId ,code} = data;
    if (!patientId)
      throw new Error("Patient ID is required");

    const existing = await this.model.findOne({
      where: { code },
    });
    if (existing) {
      throw new Error("referral code already exists");
    }
    return super.create(data);
  };
}
module.exports=ReferralService;