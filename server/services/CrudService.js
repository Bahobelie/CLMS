class CrudService {
  constructor(model) {
    this.model = model;
  }

  // Get all records
  async getAll() {
    return this.model.findAll();
  }

  // Get a record by ID
  async getById(id) {
    return this.model.findByPk(id); // Use findByPk() for finding by primary key (ID)
  }

  // Create a new record
  async create(data) {
    return this.model.create(data);
  }

  // Update a record by ID
  async update(id, data) {
    const record = await this.model.findByPk(id); // Find the record by primary key
    if (record) {
      return record.update(data); // Use update() on the found record
    }
    return null; // If record not found
  }

  // Delete a record by ID
  async delete(id) {
    const record = await this.model.findByPk(id); // Find the record by primary key
    if (record) {
      return record.destroy(); // Use destroy() to delete the record
    }
    return null; // If record not found
  }

  // Get a record by a specific condition (e.g., code)
  async getByCode(code) {
    return this.model.findOne({ where: { code: code } }); // Use findOne with where clause for conditions
  }

  // Find records by a specific condition
  async findByCondition(condition) {
    return this.model.findAll({ where: condition }); // Use findAll with where clause for conditions
  }
}

module.exports = CrudService;
