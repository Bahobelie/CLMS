const CrudService = require('./../CrudService');

class SystemConstantService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { parentId ,code} = data;
    if (!parentId)
      throw new Error("Patient ID is required");

    const existingLabTest = await this.model.findOne({
      where: { code },
    });
    if (existingLabTest) {
      throw new Error("systemConstant code already exists");
    }
    return super.create(data);
  };
}
module.exports=SystemConstantService;