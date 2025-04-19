const CrudService = require('./../CrudService');

class EmployeeService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const { type, code } = data;
    if (!type) throw new Error("Reception type is required");

    const existing = await this.model.findOne({
      where: { code },
    });

    if (existing) {
      throw new Error("Appointment already exists");
    }

    return super.create(data);
  }
}

module.exports = EmployeeService;