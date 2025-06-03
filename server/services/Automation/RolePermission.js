const CrudService = require('./../CrudService');

class RolePermissionService extends CrudService {
  constructor(model) {
    super(model);
  }
  async bulkCreate(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error("Bulk data must be a non-empty array");
    }

    for (const item of dataArray) {
      const existing = await this.model.findOne({ where: { code: item.code } });
      if (existing) {
        throw new Error(`RolePermission code '${item.code}' already exists`);
      }

    }
    // All validations passed — proceed with bulk create
    return this.model.bulkCreate(dataArray);
  }
}
module.exports = RolePermissionService;
