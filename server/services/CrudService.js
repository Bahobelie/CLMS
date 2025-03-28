
class CrudService {
  constructor(model) {
    this.model = model
  }

  async getAll() {
      return this.model.find();
  };

  async getById(id) {
    return this.model.findById(id);
  };

  async create(data) {
    return this.model.create(data);
  };

  async update(id,data) {
    return this.model.findByIdAndUpdate(id,data,{new:true});
  }
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
  async getByCode(code) {
    return this.model.findOne({ code:code });
  }
  async findByCondition(condition) {
    return await this.model.find(condition);
  }
}
module.exports=CrudService;