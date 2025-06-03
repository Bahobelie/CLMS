const CrudService = require('./../CrudService');
const SystemConstant = require('../../models/SystemConstant');
const Admin=require('../../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateNextId = require('../generateNextId');

class AdminService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { role } = data;
    // Find role from SystemConstant
    const systemRole = await SystemConstant.findByPk(role);
    if (!systemRole) {
      throw new Error("Invalid role: Role not found in SystemConstant");
    }
    return Admin.create(data);
  };

  async login(data){
    const { name, password} = data;

    const admin = await Admin.findOne({where:{name:name}});
    if (!admin) {throw new Error("Invalid credentials");
    }

    const isMatch=await admin.comparePassword(password);
    if(!isMatch) throw new Error("Invalid password credentials");

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );
   const Role=await SystemConstant.findByPk(admin.role)
    // Return success response (excluding password)

    const user={
      id:admin.id,
      code:admin.code,
      email:admin.email,
      password:admin.password,
      name:admin.name,
      phoneNumber:admin.phoneNumber,
      role:Role.description
    }
    return {
      message: "Login successful",
      token:token,
      data: { user:user }
    };
  }

  async update(id, data) {
    const { role } = data;

    // ✅ Check if the role exists in SystemConstant
    if (role) {
      const systemRole = await SystemConstant.findByPk(role);
      if (!systemRole) {
        throw new Error("Invalid role: Role not found in SystemConstant");
      }
    }

    // ✅ Hash password if it's being updated
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    // ✅ Perform update operation
    const [updatedRows] = await this.model.update(id,data, {
      where: { id }, // Ensure you are updating by the ID
      returning: true, // To return the updated rows
      plain: true, // Ensure that the result is a single object (not an array)
      runValidators: true, // Apply validation rules
    });

    if (!updatedRows) {
      throw new Error("Admin not found");
    }

    return updatedRows;
  }
  async changePassword(adminId, currentPassword, newPassword) {
    // 1. Find admin by ID
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password
    await admin.update({ password: hashedPassword });

    return {
      success: true,
      message: "Password changed successfully"
    };
  }
  async requestPasswordResetSimple(username) {
    const admin = await Admin.findOne({ where: {name:username } });
    if (!admin) {
      throw new Error("No admin found with that username.");
    }

    const tempPassword = '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await admin.update({ password: hashedPassword });


    return { message: "Temporary password has been set. Please log in and change it immediately." };
  }
}
module.exports=AdminService;