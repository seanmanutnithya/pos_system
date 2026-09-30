const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();
// TODO: update these to match your MySQL setup
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    logging: false,
    port: 3306,
  },
);

module.exports = sequelize;
