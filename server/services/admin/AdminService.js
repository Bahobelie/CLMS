const CrudService = require('./../CrudService');
const SystemConstant = require('../../models/SystemConstant');
const Admin=require('../../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AdminService extends CrudService {
  constructor(model) {
    super(model);
  }
  async create(data) {

    const { role } = data;
    // Find role from SystemConstant
    const systemRole = await SystemConstant.findOne({ _id: role });
    if (!systemRole) {
      throw new Error("Invalid role: Role not found in SystemConstant");
    }
    return super.create(data);
  };

  async login(data){
    const { email, password} = data;

    const admin = await Admin.findOne({ email });
    if (!admin) {throw new Error("Invalid credentials");
    }

    const isMatch=await admin.comparePassword(password);
    if(!isMatch) throw new Error("Invalid password credentials");

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );
   const Role=await SystemConstant.findOne({_id:admin.role})
    // Return success response (excluding password)

    const user={
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
      const systemRole = await SystemConstant.findOne({ _id: role });
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
    const updatedAdmin = await this.model.findByIdAndUpdate(id, data, {
      new: true, // Return updated document
      runValidators: true, // Ensure validation is applied
    });

    if (!updatedAdmin) {
      throw new Error("Admin not found");
    }

    return updatedAdmin;
  }
}
module.exports=AdminService;