require("module-alias/register");
const express = require("express");
const categoryRoute = require("./src/routers/category.route");
const brandRoute = require("./src/routers/brand.route");
const userRoute = require("./src/routers/user.route");
const attributeRoute = require("./src/routers/attribute.route");
const productRoute = require("./src/routers/product.route");
const { connectDB } = require("./src/models");

const app = express();
const PORT = 3000;

app.use(express.json());

categoryRoute(app);
brandRoute(app);
userRoute(app);
attributeRoute(app);
productRoute(app);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
};

startServer();
