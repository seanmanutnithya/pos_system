const {
  getAll,
  create,
  update,
  remove,
} = require("@controllers/attribute.controller");

const attributeRoute = (app) => {
  app.get("/api/v1/attribute", getAll);
  app.post("/api/v1/attribute", create);
  app.put("/api/v1/attribute/:id", update);
  app.delete("/api/v1/attribute/:id", remove);
};

module.exports = attributeRoute;
