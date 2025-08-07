const { DataSource } = require("typeorm");
require("dotenv").config();
require("reflect-metadata");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.js"],
  migrations: ["src/migration/**/*.js"],
});

module.exports = { AppDataSource };