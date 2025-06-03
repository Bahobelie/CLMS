// runSchema.js
const fs = require('fs');
const path = require('path');
const sequelize = require('./connectDb'); // Import your sequelize instance

async function runSchema() {
  const transaction = await sequelize.transaction();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      await sequelize.query(statement, { transaction });
    }

    await transaction.commit();
    console.log('✅ Schema executed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error executing schema:', error);
    throw error;
  }
}

module.exports = runSchema;
