const CrudService = require('./../CrudService');

class SystemConstantService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { parentId } = data;
    if (!parentId)
      throw new Error("Patient ID is required");

    return super.create(data);
  };
}
module.exports=SystemConstantService;