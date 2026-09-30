const {
  getAll,
  create,
  update,
  remove,
} = require("../controllers/user.controller");

const userRoute = (app) => {
  app.get("/api/v1/user", getAll);
  app.post("/api/v1/user", create);
  app.put("/api/v1/user/:id", update);
  app.delete("/api/v1/user/:id", remove);
};

module.exports = userRoute;
