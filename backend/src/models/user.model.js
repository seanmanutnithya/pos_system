const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require("@config/db");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // allowed values: admin, supervisor, staff (enforced by chk_user_role)
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "tbl_user",
    timestamps: true,
    createdAt: "created_date",
    updatedAt: "updated_date",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    hooks: {
      // Hash the password whenever it is set, on create and on update,
      // so a plain-text password is never saved.
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  },
);

// Never send the password hash in API responses
User.prototype.toJSON = function () {
  const values = { ...this.get({ plain: true }) };
  delete values.password;
  return values;
};

module.exports = User;
