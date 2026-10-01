const {
  getAll,
  create,
  update,
  remove,
} = require("@controllers/product.controller");

const productRoute = (app) => {
  app.get("/api/v1/product", getAll);
  app.post("/api/v1/product", create);
  app.put("/api/v1/product/:id", update);
  app.delete("/api/v1/product/:id", remove);
};

module.exports = productRoute;
