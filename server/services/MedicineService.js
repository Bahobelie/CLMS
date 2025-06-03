const CrudService = require('./CrudService');
const sequelize = require('../config/connectDb');

class MedicineService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Custom create method with a uniqueness check and optional logic
   */
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const { name } = data;

      // Optional: Check for duplicate medicine
      const existing = await this.model.findOne({
        where: { name, },
        transaction
      });

      if (existing) {
        throw new Error('Medicine with same name, dosage and brand already exists');
      }

      // Create the medicine using the generic method
      const result = await super.create(data, { transaction });

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Optional: Adjust quantity for restocking or dispensing
   */
  async adjustQuantity(id, adjustment) {
    const transaction = await sequelize.transaction();
    try {
      const medicine = await this.model.findByPk(id, { transaction });

      if (!medicine) throw new Error('Medicine not found');

      const newQuantity = medicine.quantity + adjustment;
      if (newQuantity < 0) throw new Error('Insufficient stock');

      medicine.quantity = newQuantity;
      await medicine.save({ transaction });

      await transaction.commit();
      return medicine;
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
        throw new Error(`medicine code '${item.code}' already exists`);
      }

    }
    // All validations passed — proceed with bulk create
    return this.model.bulkCreate(dataArray);
  }
}

module.exports = MedicineService;
