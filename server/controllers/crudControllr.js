const { raw } = require('express');
const { Op } = require('sequelize');

class crudControllr {
  constructor(service) {
    this.service = service;
  }
  getAll=async (req, res) => {
   try {
     const items=await this.service.getAll();
     res.status(200).send(items);
   }
   catch(err) {
     res.status(500).json({ error:err.message });
   }
  };
  getById=async (req, res) => {
    try {
      const items=await this.service.getById(String(req.params.id));
      if(!items.length) {
        return res.status(404).json({ error:"Item not found" });
      }
      res.status(200).send(items);
    }
    catch(err) {
      res.status(500).json({ error:err.message });
    }
  };
  create=async (req, res) => {
    try {
      const items=await this.service.create(req.body);
      res.status(201).json(items);
    }
    catch (err)
    {
      return res.status(500).json({ error:err.message });
    }
  };
  update=async (req, res) => {
    try {
      const item=await this.service.getById(req.params.id);
      if(!item) return res.status(404).json({ error:"Item not found" });

      const updatedItem= await this.service.update(req.params.id, req.body);

      res.status(200).send(updatedItem);
    }
    catch (err)
    {
      res.status(500).json({ error:err.message });
    }
  };
  delete=async (req,res)=>{
    try {
      // Check if the item exists before deleting
      const item = await this.service.getById(req.params.id);
      if (!item) {
        res.status(404).json({ error: "Item not found" })
      }
     await this.service.delete(req.params.id);

      res.status(200).json({message:"deleted item"});
    }
    catch (err)
    {
      res.status(500).json({ error:err.message });
    }
  }
  getByCode=async(req,res)=> {
    try {
      const { code } = req.params;
      const items = await this.service.getByCode(code);
      if (!items) {
        res.status(404).json({ error: "Item not found" });
      }
      res.status(200).json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
    findByCondition = async (req, res) => {
      try {
        const condition = req.query; // Assuming condition is passed in parameter


        if (req.query.createdAt) {
          // Validate date format (YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.createdAt)) {
            return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
          }

          const dateOnly = req.query.createdAt; // "2025-04-15"


          // Convert to proper date range
          condition.createdAt = {
            [Op.between]: [
              new Date(`${dateOnly}T00:00:00.000Z`), // Start of day (UTC)
              new Date(`${dateOnly}T23:59:59.999Z`)  // End of day (UTC)
            ]
          };
        };


        const items = await this.service.findByCondition(condition);

        if (!items?.length) {
          return res.status(200).json({
            message: "No items found",
            query: condition
          });
        }

        res.status(200).json(items);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
}
module.exports=crudControllr;