const { DataTypes } = require("sequelize");
const sequelize = require("@config/db");

const Attribute = sequelize.define(
  "Attribute",
  {
    attribute_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // attribute_name + attribute_value must be unique together (uq_attribute),
    // e.g. only one "Size" / "Large"
    attribute_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "uq_attribute",
    },
    attribute_value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "uq_attribute",
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
  },
  {
    tableName: "tbl_attribute",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: false, // tbl_attribute has no updated_date column
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
);

module.exports = Attribute;
