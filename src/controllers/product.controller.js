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
      const { nombre, descripcion, imagen_url, precio, stock, categoria_id, codigo_barras } = req.body;

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

      const product = await ProductModel.create({
        nombre: nombre.trim(),
        descripcion,
        imagen_url: imagen_url ? String(imagen_url).trim() : null,
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

  // Este método actualiza un producto existente.
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        descripcion = '',
        imagen_url = '',
        precio,
        stock,
        codigo_barras = '',
        estado,
      } = req.body;

      if (!nombre || precio === undefined || stock === undefined || estado === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, precio, stock y estado son obligatorios',
        });
      }

      const parsedPrice = Number(precio);
      const parsedStock = Number(stock);

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser un numero valido',
        });
      }

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'El stock debe ser un numero entero valido',
        });
      }

      const updatedProduct = await ProductModel.updateById(id, {
        nombre: String(nombre).trim(),
        descripcion: String(descripcion).trim(),
        imagen_url: String(imagen_url).trim(),
        precio: parsedPrice,
        stock: parsedStock,
        codigo_barras: String(codigo_barras).trim(),
        estado: Boolean(estado),
      });

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
      }

      return res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        data: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar producto',
      });
    }
  },
};

// Exportamos el controlador.
module.exports = ProductController;
