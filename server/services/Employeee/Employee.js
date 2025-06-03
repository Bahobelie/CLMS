const CrudService = require('./../CrudService');
const axios = require('axios');
const Admin=require('../../models/Admin');
const sequelize=require('../../config/connectDb');

class EmployeeService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const { type, code, firstname, lastname, phonenumber } = data;

      if (!type) throw new Error("Reception type is required");

      const existing = await this.model.findOne({
        where: { code },
        transaction
      });

      if (existing) {
        throw new Error("Appointment already exists");
      }


      const admin = await Admin.create({
        code: `${code}-${Date.now()}`,
        name: `${firstname} ${lastname}`,
        phoneNumber: !phonenumber ? null : phonenumber,
        password:'123456',
        email:`${firstname}${Date.now()}@gmail.com`,
        role: type
      }, { transaction });

      const result = await super.create(data, { transaction });

      await transaction.commit();
      return result;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async bulkCreate(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error("Bulk data must be a non-empty array");
    }

    for (const item of dataArray) {
      const existing = await this.model.findOne({ where: { code: item.code } });
      if (existing) {
        throw new Error(`Empployee code '${item.code}' already exists`);
      }

    }
    // All validations passed — proceed with bulk create
    return this.model.bulkCreate(dataArray);
  }
}

module.exports = EmployeeService;