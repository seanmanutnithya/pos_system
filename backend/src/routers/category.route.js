const {
  getAll,
  create,
  update,
  remove,
} = require("../controllers/category.controller");

const categoryRoute = (app) => {
  app.get("/api/v1/category", getAll);
  app.post("/api/v1/category", create);
  app.put("/api/v1/category/:id", update);
  app.delete("/api/v1/category/:id", remove);
};

module.exports = categoryRoute;
