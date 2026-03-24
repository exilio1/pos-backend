const AuthModel = require('../models/auth.model');

const RoleController = {
  async getAll(req, res) {
    try {
      const roles = await AuthModel.findAllRoles();
      return res.json({ success: true, data: roles });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = RoleController;
