// Importamos el modelo de cajas.
const CashModel = require('../models/cash.model');

// Este controlador maneja las respuestas del módulo de cajas.
const CashController = {
  // Devuelve la caja abierta actual o indica que no hay ninguna.
  async getCurrent(req, res) {
    try {
      const cashRegister = await CashModel.findOpenCashRegister();

      if (!cashRegister) {
        return res.json({
          success: true,
          data: null,
        });
      }

      const totalVentas = await CashModel.getCashSalesTotal(cashRegister.id);
      const esperado = Number(cashRegister.monto_apertura) + totalVentas;

      return res.json({
        success: true,
        data: {
          ...cashRegister,
          total_ventas_efectivo: totalVentas,
          monto_esperado: esperado,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar la caja',
      });
    }
  },

  // Abre una nueva caja si no hay otra abierta.
  async open(req, res) {
    try {
      const { monto_apertura } = req.body;

      if (monto_apertura === undefined || monto_apertura === null || monto_apertura === '') {
        return res.status(400).json({
          success: false,
          message: 'Debes ingresar el monto de apertura',
        });
      }

      const openingAmount = Number(monto_apertura);

      if (Number.isNaN(openingAmount) || openingAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto de apertura debe ser un número válido',
        });
      }

      const existing = await CashModel.findOpenCashRegister();
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una caja abierta',
        });
      }

      const cashRegister = await CashModel.openCashRegister({
        userId: req.user.sub,
        openingAmount,
      });

      return res.status(201).json({
        success: true,
        message: 'Caja abierta correctamente',
        data: cashRegister,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al abrir la caja',
      });
    }
  },

  // Cierra la caja abierta usando el monto físico contado.
  async close(req, res) {
    try {
      const { monto_cierre } = req.body;

      if (monto_cierre === undefined || monto_cierre === null || monto_cierre === '') {
        return res.status(400).json({
          success: false,
          message: 'Debes ingresar el monto de cierre',
        });
      }

      const closingAmount = Number(monto_cierre);

      if (Number.isNaN(closingAmount) || closingAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto de cierre debe ser un número válido',
        });
      }

      const openCashRegister = await CashModel.findOpenCashRegister();
      if (!openCashRegister) {
        return res.status(400).json({
          success: false,
          message: 'No hay una caja abierta para cerrar',
        });
      }

      const totalVentas = await CashModel.getCashSalesTotal(openCashRegister.id);
      const esperado = Number(openCashRegister.monto_apertura) + totalVentas;

      const closed = await CashModel.closeCashRegister({
        cashRegisterId: openCashRegister.id,
        userId: req.user.sub,
        closingAmount,
      });

      return res.json({
        success: true,
        message: 'Caja cerrada correctamente',
        data: {
          ...closed,
          total_ventas_efectivo: totalVentas,
          monto_esperado: esperado,
          diferencia: closingAmount - esperado,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al cerrar la caja',
      });
    }
  },
};

// Exportamos el controlador.
module.exports = CashController;
