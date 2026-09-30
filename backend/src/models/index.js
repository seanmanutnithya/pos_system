const sequelize = require("../config/db");
const Category = require("./category.model");
const Brand = require("./brand.model");
const User = require("./user.model");
const Attribute = require("./attribute.model");
const Product = require("./product.model");

// A product belongs to one category, one brand and optionally one attribute.
// The "as" names are the keys used when these are included in a query.
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
Product.belongsTo(Attribute, { foreignKey: "attribute_id", as: "attribute" });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("database connected successfully");
    return true;
  } catch (error) {
    console.error("database connection failed:", error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  connectDB,
  Category,
  Brand,
  User,
  Attribute,
  Product,
};
