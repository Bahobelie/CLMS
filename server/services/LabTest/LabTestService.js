const CrudService = require('./../CrudService');

class LabTestService extends CrudService {
  constructor(model) {
    super(model);
  }

  /**
   * Creates a single lab test (with uniqueness check)
   */
  async create(data) {
    const { patientid, code } = data;
    if (!patientid) throw new Error("Patient ID is required");

    const existingLabTest = await this.model.findOne({
      where: { code, patientid },
    });

    if (existingLabTest) {
      throw new Error("LabTest with the same patient ID and code already exists");
    }

    return super.create(data);
  }

  /**
   * Bulk creates lab tests after deactivating all existing ones
   * @param {string} patientid - Patient ID
   * @param {Array} labTests - Array of new lab tests to create
   * @returns {Promise<Array>} - Newly created lab tests
   */
  async bulkCreateWithDeactivation(patientid, labTests) {
    if (!patientid) throw new Error("Patient ID is required");
    if (!Array.isArray(labTests)) throw new Error("Lab tests must be an array");


    // Start a database transaction (ensures atomicity)
    const transaction = await this.model.sequelize.transaction();

    try {

      // STEP 2: Bulk insert new lab tests (default isActive: true)
      const newTests = await this.model.bulkCreate(
        labTests.map(test => ({
          ...test
        })),
        { transaction ,validate:true}
      );

      // Commit the transaction if everything succeeds
      await transaction.commit();

      return newTests;
    } catch (error) {
      // Rollback if any error occurs
      await transaction.rollback();
      console.error("Validation Error Details:", error.errors); // Log Sequelize validation errors
      throw error; // Re-throw for error handling
    }
  }

  /**
   * Gets active lab tests for a patient
   */
  async getActiveTests(patientid) {
    return this.model.findAll({
      where: { patientid, isActive: true },
    });
  }
}

module.exports = LabTestService;