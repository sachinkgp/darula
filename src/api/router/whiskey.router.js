const router = require('express').Router();
const whiskeyController = require('../controller/whiskey.controller');

// Category routes
router.get('/categories', whiskeyController.getCategories);
router.get('/categories/:id', whiskeyController.getCategoryById);

// Brand routes
router.get('/brands', whiskeyController.getBrands);
router.get('/brands/:id', whiskeyController.getBrandById);

// Product routes
router.get('/products', whiskeyController.getProducts);
router.get('/products/search', whiskeyController.searchProducts);
router.get('/products/:id', whiskeyController.getProductById);

module.exports = router;

