const { raw } = require('express');
const { Op } = require('sequelize');
const { io } = require('socket.io-client');

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
      const condition = req.query;
      const { Op } = require('sequelize');

      // Helper function to process date ranges
      const processDateFilter = (fieldName, queryValue) => {
        if (!queryValue) return;

        // Handle comparison operators (>=, <=)
        if (queryValue.startsWith('>=') || queryValue.startsWith('<=')) {
          const operator = queryValue.startsWith('>=') ? Op.gte : Op.lte;
          const dateStr = queryValue.substring(2);
          condition[fieldName] = {
            [operator]: new Date(dateStr)
          };
          return;
        }

        // Handle exact date (YYYY-MM-DD format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(queryValue)) {
          condition[fieldName] = {
            [Op.between]: [
              new Date(`${queryValue}T00:00:00.000Z`),
              new Date(`${queryValue}T23:59:59.999Z`)
            ]
          };
          return;
        }

        // Handle full ISO date string
        if (new Date(queryValue).toString() !== 'Invalid Date') {
          condition[fieldName] = new Date(queryValue);
          return;
        }

        throw new Error(`Invalid date format for ${fieldName}. Use YYYY-MM-DD or ISO format`);
      };

      // Process date filters
      processDateFilter('createdAt', req.query.createdAt);
      processDateFilter('start_time', req.query.start_time);
      processDateFilter('end_time', req.query.end_time);

      const items = await this.service.findByCondition(condition);

      if (!items?.length) {
        return res.status(200).json({
          message: "No items found",
          query: condition
        });
      }

      res.status(200).json(items);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        details: "Invalid date format. Please use YYYY-MM-DD, ISO format, or operators (>=, <=)"
      });
    }
  };
}
module.exports=crudControllr;