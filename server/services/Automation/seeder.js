const SystemConstant = require('../../models/SystemConstant.js');
const sequelize = require('../../config/connectDb'); // Assuming this is your Sequelize instance

const detailedLabTests = {
  Hematology: {
    CBC: {
      WBC: { name: "White Blood Cell Count (WBC)", range: "4,000 - 11,000 /µL" },
      HGB: { name: "Hemoglobin (HGB)", range: "Male: 13.8 - 17.2 g/dL, Female: 12.1 - 15.1 g/dL" },
      HCT: { name: "Hematocrit (HCT)", range: "Male: 40.7 - 50.3%, Female: 36.1 - 44.3%" },
      RBC: { name: "Red Blood Cell Count (RBC)", range: "Male: 4.7 - 6.1 million/µL, Female: 4.2 - 5.4 million/µL" },
      MCV: { name: "Mean Corpuscular Volume (MCV)", range: "80 - 100 fL" },
      MCH: { name: "Mean Corpuscular Hemoglobin (MCH)", range: "27 - 33 pg" },
      MCHC: { name: "Mean Corpuscular Hemoglobin Concentration (MCHC)", range: "32 - 36 g/dL" },
      RDW: { name: "Red Cell Distribution Width (RDW)", range: "11.5 - 14.5%" },
      PLT: { name: "Platelet Count (PLT)", range: "150,000 - 450,000 /µL" },
      MPV: { name: "Mean Platelet Volume (MPV)", range: "7.5 - 11.5 fL" },
      PCT: { name: "Plateletcrit (PCT)", range: "0.22 - 0.24%" },
      PDW: { name: "Platelet Distribution Width (PDW)", range: "10 - 18%" },
      PLCR: { name: "Platelet Large Cell Ratio (PLCR)", range: "15 - 35%" }
    },
    ESR: { name: "Erythrocyte Sedimentation Rate (ESR)", range: "Male: 0 - 15 mm/hr, Female: 0 - 20 mm/hr" },
    ReticulocyteCount: { name: "Reticulocyte Count", range: "0.5 - 2.5%" },
    BloodGroup: { name: "Blood Group", range: "A, B, AB, O (+/-)" },
    PeripheralBloodSmear: { name: "Peripheral Blood Smear", range: "Normal morphology" },
  },
  Chemistry: {
    RFT: {
      UREA: { name: "Urea", range: "10 - 50 mg/dL" },
      CREATININE: { name: "Creatinine", range: "Male: 0.7 - 1.3 mg/dL, Female: 0.6 - 1.1 mg/dL" },
      BUN: { name: "Blood Urea Nitrogen (BUN)", range: "7 - 20 mg/dL" }
    },
    LFT: {
      ALP: { name: "Alkaline Phosphatase (ALP)", range: "30 - 120 U/L" },
      AST: { name: "Aspartate Aminotransferase (AST)", range: "10 - 40 U/L" },
      ALT: { name: "Alanine Aminotransferase (ALT)", range: "7 - 56 U/L" },
      BilirubinT: { name: "Bilirubin (Total)", range: "0.1 - 1.2 mg/dL" },
      BilirubinD: { name: "Bilirubin (Direct)", range: "0.0 - 0.3 mg/dL" },
      Albumin: { name: "Albumin", range: "3.5 - 5.0 g/dL" },
      GGT: { name: "Gamma-Glutamyl Transferase (GGT)", range: "8 - 61 U/L" }
    },
    LipidProfile: {
      TotalCholesterol: { name: "Total Cholesterol", range: "< 200 mg/dL" },
      Triglycerides: { name: "Triglycerides", range: "< 150 mg/dL" },
      HDLC: { name: "High-Density Lipoprotein Cholesterol (HDL-C)", range: "Male: > 40 mg/dL, Female: > 50 mg/dL" },
      LDLC: { name: "Low-Density Lipoprotein Cholesterol (LDL-C)", range: "< 100 mg/dL" },
      VLDL: { name: "Very-Low-Density Lipoprotein (VLDL)", range: "5 - 40 mg/dL" }
    },
    FBS: { name: "Fasting Blood Sugar", range: "70 - 99 mg/dL" },
    RBS: { name: "Random Blood Sugar", range: "< 140 mg/dL" },
    URICACID: { name: "Uric Acid", range: "Male: 3.4 - 7.0 mg/dL, Female: 2.4 - 6.0 mg/dL" },
    Calcium: { name: "Calcium", range: "8.5 - 10.2 mg/dL" },
    Potassium: { name: "Potassium", range: "3.5 - 5.1 mmol/L" },
    Sodium: { name: "Sodium", range: "135 - 145 mmol/L" }
  },
  Coag_Profile: {
    PT: { name: "Prothrombin Time (PT)", range: "11 - 13.5 seconds" },
    INR: { name: "International Normalized Ratio (INR)", range: "0.8 - 1.1" },
    APTT: { name: "Activated Partial Thromboplastin Time (APTT)", range: "30 - 40 seconds" },
    D_dimer: { name: "D-dimer", range: "< 500 ng/mL" }
  },
  Immunoassay: {
    TFT: {
      TSH: { name: "Thyroid-Stimulating Hormone (TSH)", range: "0.4 - 4.0 µIU/mL" },
      T3: { name: "Triiodothyronine (T3)", range: "80 - 200 ng/dL" },
      T4: { name: "Thyroxine (T4)", range: "4.5 - 11.2 µg/dL" }
    },
    CardiacMarkers: {
      CK_MB: { name: "Creatine Kinase-MB (CK-MB)", range: "< 6.3 ng/mL" },
      TroponinI: { name: "Troponin I", range: "< 0.04 ng/mL" },
      BNP: { name: "B-type Natriuretic Peptide (BNP)", range: "< 100 pg/mL" }
    }
  },
  Urinalysis: {
    UrineChemical: {
      PROTEIN: { name: "Protein", range: "Negative" },
      GLUCOSE: { name: "Glucose", range: "Negative" },
      KETONE: { name: "Ketones", range: "Negative" },
      BILIRUBIN: { name: "Bilirubin", range: "Negative" },
      PH: { name: "pH", range: "4.5 - 8.0" },
      BLOOD: { name: "Blood", range: "Negative" },
      LEUKOCYTE: { name: "Leukocytes", range: "Negative" },
      SG: { name: "Specific Gravity", range: "1.005 - 1.030" }
    }
  }
};
const seedData = async () => {
  const transaction = await sequelize.transaction();
  try {

    // Seed Roles and Services
    const rolesAndServices = [
      { code: 'SYC-000001', name: "Injection", type: 'Service', description: 'Injection', index: 1 },
      { code: 'SYC-000002', name: "UltraSound", type: 'Service', description: 'UltraSound', index: 2 },
      { code: 'SYC-000003', name: "Admin", type: 'Role', description: 'Admin', index: 3 },
      { code: 'SYC-000004', name: "Doctor", type: 'Role', description: 'Doctor', index: 4 },
      { code: 'SYC-000005', name: "Emergency", type: 'Role', description: 'emergency', index: 5 },
      { code: 'SYC-000006', name: "Receptionist", type: 'Role', description: 'Receptionist', index: 6 },
      { code: 'SYC-000007', name: "LabTechnician", type: 'Role', description: 'LabTechnician', index: 7 },
      { code: 'SYC-000008', name: "InjectionRoomStaff", type: 'Role', description: 'InjectionRoomStaff', index: 8 },
      { code: 'SYC-000009', name: "Sonographer", type: 'Role', description: 'Sonographer', index: 9 },
    ];

    // Insert roles using Sequelize bulkCreate
    await SystemConstant.bulkCreate(rolesAndServices, { transaction });
    console.log('Roles and Services seeded.');

    let index = 10;
    for (const [categoryName, categoryData] of Object.entries(detailedLabTests)) {
      const category = await SystemConstant.create({
        code: `SYC-${String(index).padStart(6, '0')}`,
        name: categoryName,
        type: 'LabTest',
        description: categoryName,
        index: index,
      }, { transaction });
      console.log(`Category seeded: ${categoryName}`);
      index++;

      for (const [subcategoryName, subcategoryData] of Object.entries(categoryData)) {
        // Check if this is a nested object with name/range or another level of hierarchy
        if (subcategoryData.name && subcategoryData.range) {
          // This is a direct test (like ESR)
          await SystemConstant.create({
            code: `SYC-${String(index).padStart(6, '0')}`,
            name: subcategoryName,
            type: 'LabTest',
            description: subcategoryData.name,
            index: index,
            parentId: category.id,
            referencerange: subcategoryData.range
          }, { transaction });
          console.log(`Test seeded: ${subcategoryName} under ${categoryName}`);
          index++;
        } else {
          // This is a subcategory (like CBC)
          const subcategory = await SystemConstant.create({
            code: `SYC-${String(index).padStart(6, '0')}`,
            name: subcategoryName,
            type: 'LabTest',
            description: subcategoryName,
            index: index,
            parentId: category.id,
          }, { transaction });
          console.log(`Subcategory seeded: ${subcategoryName} under ${categoryName}`);
          index++;

          // Handle the tests within the subcategory
          for (const [testName, testData] of Object.entries(subcategoryData)) {
            await SystemConstant.create({
              code: `SYC-${String(index).padStart(6, '0')}`,
              name: testName,
              type: 'LabTest',
              description: testData.name,
              index: index,
              parentId: subcategory.id,
              referencerange: testData.range
            }, { transaction });
            console.log(`Test seeded: ${testName} under ${subcategoryName}`);
            index++;
          }
        }
      }
    }

    await transaction.commit();
    console.log('Seeding completed successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding data:', error.message);
  }
};

seedData().catch(error => console.error('Error in seedData:', error));