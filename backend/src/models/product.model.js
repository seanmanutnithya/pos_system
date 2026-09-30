const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// MySQL returns DECIMAL columns as strings ("12.50"), so return them as numbers
const decimalAsNumber = (field) =>
  function () {
    const value = this.getDataValue(field);
    return value == null ? value : Number(value);
  };

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // must be > 0 (chk_product_price)
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get: decimalAsNumber("price"),
    },
    // must be >= 0 (chk_product_cost)
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get: decimalAsNumber("cost"),
    },
    // must be >= 0 (chk_product_stock)
    quantity_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tbl_product_master",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: "updated_date",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  }
);

module.exports = Product;
