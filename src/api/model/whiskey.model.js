const mongoose = require('mongoose');

// Whiskey Category Schema
const whiskeyCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Bourbon', 'Single Malt', 'Double Barrel', 'Blended Scotch']
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhiskeyCategory',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhiskeyCategory',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  volume: {
    type: String,
    default: '750ml'
  },
  alcoholContent: {
    type: String,
    default: ''
  },
  age: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
brandSchema.index({ category: 1 });
brandSchema.index({ slug: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });

const WhiskeyCategory = mongoose.model('WhiskeyCategory', whiskeyCategorySchema);
const Brand = mongoose.model('Brand', brandSchema);
const Product = mongoose.model('Product', productSchema);

module.exports = {
  WhiskeyCategory,
  Brand,
  Product
};

