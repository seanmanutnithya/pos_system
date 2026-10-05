const {
  getAll,
  create,
  update,
  remove,
  uploadImage,
  removeImage,
} = require("@controllers/product.controller");
const { receiveImage } = require("@helper/image.helper");

const productRoute = (app) => {
  app.get("/api/v1/product", getAll);
  app.post("/api/v1/product", create);
  app.put("/api/v1/product/:id", update);
  app.delete("/api/v1/product/:id", remove);
  // multipart/form-data with one file in the "image" field
  app.put("/api/v1/product/:id/image", receiveImage, uploadImage);
  app.delete("/api/v1/product/:id/image", removeImage);
};

module.exports = productRoute;
