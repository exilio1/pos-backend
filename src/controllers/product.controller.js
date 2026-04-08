// Importamos el modelo de productos.
const ProductModel = require('../models/product.model');

// Este controlador maneja las respuestas del módulo de productos.
const ProductController = {
  // Este método devuelve el listado de productos.
  async getAll(req, res) {
    try {
      // Consultamos todos los productos en la base de datos.
      const products = await ProductModel.findAll();

      // Si todo sale bien, enviamos la lista al frontend.
      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      // Si falla la consulta, enviamos error del servidor.
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar productos',
      });
    }
  },

  // Este método crea un nuevo producto.
  async create(req, res) {
    try {
      const { nombre, descripcion, precio, stock, categoria_id, codigo_barras } = req.body;

      // Validaciones básicas.
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es obligatorio',
        });
      }

      if (precio === undefined || precio === null || Number(precio) < 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio es obligatorio y debe ser mayor o igual a 0',
        });
      }

      if (stock !== undefined && Number(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: 'El stock no puede ser negativo',
        });
      }

      // Guardamos el producto en la base de datos.
      const product = await ProductModel.create({
        nombre: nombre.trim(),
        descripcion,
        precio: Number(precio),
        stock: stock !== undefined ? Number(stock) : 0,
        categoria_id,
        codigo_barras,
      });

      return res.status(201).json({
        success: true,
        message: 'Producto creado correctamente',
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al crear el producto',
      });
    }
  },

  // Devuelve las categorías disponibles.
  async getCategories(req, res) {
    try {
      const categories = await ProductModel.findAllCategories();

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar categorías',
      });
    }
  },
};

// Exportamos el controlador.
module.exports = ProductController;
