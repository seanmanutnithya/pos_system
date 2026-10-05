const {
  getAll,
  create,
  update,
  remove,
  uploadImage,
  removeImage,
} = require("@controllers/brand.controller");
const { receiveImage } = require("@helper/image.helper");

const brandRoute = (app) => {
  app.get("/api/v1/brand", getAll);
  app.post("/api/v1/brand", create);
  app.put("/api/v1/brand/:id", update);
  app.delete("/api/v1/brand/:id", remove);
  // multipart/form-data with one file in the "image" field
  app.put("/api/v1/brand/:id/image", receiveImage, uploadImage);
  app.delete("/api/v1/brand/:id/image", removeImage);
};

module.exports = brandRoute;
