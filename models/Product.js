const mongoose = require("mongoose");
const slugify = require("slugify");

// ----------------------------
// IMAGE SCHEMA
// ----------------------------
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

// ----------------------------
// VARIANT SCHEMA
// ----------------------------
const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    color: { type: String, default: null },
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

// ----------------------------
// MAIN PRODUCT SCHEMA
// ----------------------------
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: { type: String, unique: true, index: true },

    description: { type: String },

    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },

    categories: [{ type: String }],
    tags: [{ type: String }],

    images: [ImageSchema],
    variants: [VariantSchema],

    totalStock: { type: Number, default: 0 },

    featured: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "draft", "hidden"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ----------------------------
// SLUG GENERATION (SAFE)
// ----------------------------
ProductSchema.pre("save", function () {
  if (this.isModified("name") && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

// ----------------------------
// AUTO CALCULATE TOTAL STOCK
// ----------------------------
ProductSchema.pre("save", function () {
  if (Array.isArray(this.variants) && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (sum, v) => sum + (v.stock || 0),
      0
    );
  } else {
    this.totalStock = 0;
  }
});

module.exports = mongoose.model("Product", ProductSchema);
