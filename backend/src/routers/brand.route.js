const {
  getAll,
  create,
  update,
  remove,
} = require("../controllers/brand.controller");

const brandRoute = (app) => {
  app.get("/api/v1/brand", getAll);
  app.post("/api/v1/brand", create);
  app.put("/api/v1/brand/:id", update);
  app.delete("/api/v1/brand/:id", remove);
};

module.exports = brandRoute;
