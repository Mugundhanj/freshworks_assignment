const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

router.param('id', productController.checkID);
router
  .route('/')
  .get( productController.getAllProducts)
  .post(productController.checkBody,productController.checkSize,productController.createProduct);

  router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.checkBody,productController.updateProduct)
  .delete(
    productController.deleteProduct
  );
  module.exports = router;