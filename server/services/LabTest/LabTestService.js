const CrudService = require('./../CrudService');

class LabTestService extends CrudService {
  constructor(model, io) {
    super(model);
    this.io = io;
  }

  async create(data) {
    const { patientid, code } = data;
    if (!patientid) throw new Error("Patient ID is required");

    const existingLabTest = await this.model.findOne({
      where: { code, patientid },
    });

    if (existingLabTest) {
      throw new Error("LabTest with the same patient ID and code already exists");
    }

    const newTest = await super.create(data);

    this.sendDoctorNotification(newTest, 'created');
    return newTest;
  }

  async bulkCreateWithDeactivation(patientid, labTests) {
    if (!patientid) throw new Error("Patient ID is required");
    if (!Array.isArray(labTests)) throw new Error("Lab tests must be an array");

    const transaction = await this.model.sequelize.transaction();

    try {
      const newTests = await this.model.bulkCreate(
        labTests.map(test => ({
          ...test,
        })),
        { transaction}
      );

      await transaction.commit();

      // Notify doctor for each new lab test
        this.sendDoctorNotification(newTests[0], 'created');

      return newTests;
    } catch (error) {
      await transaction.rollback();
      console.error("Validation Error Details:", error.message);
      throw error;
    }
  }

  async getActiveTests(patientid) {
    return this.model.findAll({
      where: { patientid, isActive: true },
    });
  }

  async bulkUpdatePaymentStatus(ids, paymntstatus) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array");
    }

    if (!['paid', 'unpaid'].includes(paymntstatus)) {
      throw new Error("Invalid payment status");
    }

    const transaction = await this.model.sequelize.transaction();

    try {
      const [updatedCount, updatedTests] = await this.model.update(
        { paymntstatus },
        {
          where: { id: ids },
          returning: true,
          transaction
        }
      );

      await transaction.commit();

      if (updatedCount === 0) {
        throw new Error("No tests found with the provided IDs");
      }

      // Optionally notify doctor
      updatedTests.forEach(test => {
        this.sendDoctorNotification(test, 'updated', ['paymntstatus']);
      });

      return updatedTests;
    } catch (error) {
      await transaction.rollback();
      console.error("Bulk update payment status error:", error);
      throw error;
    }
  }

  sendDoctorNotification(test, action, changedFields = []) {
    if (!this.io) return;

    const message = action === 'created'
      ? `New Lab Test registered for patient ID: ${test.patientid}`
      : `Lab Test updated for patient ID: ${test.patientid} (${changedFields.join(', ')})`;

    console.log('send notfication',message);

    this.io.to('labtechnician').emit('labtechnician_notification', {
      id: Date.now(),
      title: action === 'created' ? 'New Lab Test Created' : 'Lab Test Updated',
      message,
      type: 'message',
      timestamp: new Date().toISOString(),
      role: 'labtechnician',
    });
  }
}

module.exports = LabTestService;
