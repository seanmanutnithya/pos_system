const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { Product, Category, Brand, Attribute } = require("../models");

const MAX_MONEY = 99999999.99; // largest value DECIMAL(10,2) can hold
const MAX_INT = 2147483647; // largest value an INT column can hold

// Every product response includes the names of its category, brand and attribute
const productIncludes = [
  { model: Category, as: "category", attributes: ["category_id", "category_name"] },
  { model: Brand, as: "brand", attributes: ["brand_id", "brand_name"] },
  {
    model: Attribute,
    as: "attribute",
    attributes: ["attribute_id", "attribute_name", "attribute_value"],
  },
];

const findProductById = (id) =>
  Product.findByPk(id, { include: productIncludes });

const trimText = (value) => (typeof value === "string" ? value.trim() : value);

// Only these columns can be set from the request body.
// Keys that are not sent are left out so an update doesn't overwrite them.
const pickProductFields = ({
  product_name,
  category_id,
  brand_id,
  attribute_id,
  sku,
  barcode,
  description,
  price,
  cost,
  quantity_stock,
  active,
} = {}) => {
  const fields = {
    product_name: trimText(product_name),
    category_id,
    brand_id,
    attribute_id,
    sku: trimText(sku),
    // an empty barcode is stored as NULL: barcode is unique, and many
    // products can have no barcode but only one can have ""
    barcode: trimText(barcode) === "" ? null : trimText(barcode),
    description,
    price,
    cost,
    quantity_stock,
    active,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  );
};

// Max lengths match the tbl_product_master columns. Checking them here returns
// a 400 instead of MySQL cutting the text off.
const checkRequiredText = (name, value, maxLength) => {
  if (typeof value !== "string" || !value) return `${name} is required`;
  if (value.length > maxLength) {
    return `${name} must be at most ${maxLength} characters`;
  }
  return null;
};

const isId = (value) => Number.isInteger(value) && value > 0 && value <= MAX_INT;
const isMoney = (value) =>
  typeof value === "number" && Number.isFinite(value) && value <= MAX_MONEY;

const validateProductFields = (fields, { isCreate }) => {
  // On create every required field is checked; on update only the ones sent
  const shouldCheck = (key) => isCreate || key in fields;
  const {
    product_name,
    category_id,
    brand_id,
    attribute_id,
    sku,
    barcode,
    description,
    price,
    cost,
    quantity_stock,
    active,
  } = fields;

  if (shouldCheck("product_name")) {
    const error = checkRequiredText("product_name", product_name, 200);
    if (error) return error;
  }
  if (shouldCheck("sku")) {
    const error = checkRequiredText("sku", sku, 50);
    if (error) return error;
  }
  if (shouldCheck("category_id") && !isId(category_id)) {
    return "category_id is required and must be a positive whole number";
  }
  if (shouldCheck("brand_id") && !isId(brand_id)) {
    return "brand_id is required and must be a positive whole number";
  }
  if (attribute_id != null && !isId(attribute_id)) {
    return "attribute_id must be a positive whole number";
  }
  if (barcode != null && (typeof barcode !== "string" || barcode.length > 50)) {
    return "barcode must be text of at most 50 characters";
  }
  if (
    description != null &&
    (typeof description !== "string" || description.length > 500)
  ) {
    return "description must be text of at most 500 characters";
  }
  if (shouldCheck("price") && !(isMoney(price) && price > 0)) {
    return `price is required and must be a number greater than 0 and at most ${MAX_MONEY}`;
  }
  if ("cost" in fields && !(isMoney(cost) && cost >= 0)) {
    return `cost must be a number from 0 to ${MAX_MONEY}`;
  }
  if (
    "quantity_stock" in fields &&
    !(Number.isInteger(quantity_stock) && quantity_stock >= 0 && quantity_stock <= MAX_INT)
  ) {
    return "quantity_stock must be a whole number of 0 or more";
  }
  if (active !== undefined && typeof active !== "boolean") {
    return "active must be true or false";
  }
  return null;
};

const handleError = (res, error) => {
  // UniqueConstraintError extends ValidationError, so check it first
  if (error instanceof UniqueConstraintError) {
    // path is the column that already has this value: sku or barcode
    const field = error.errors[0]?.path ?? "sku or barcode";
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }
  if (error instanceof ForeignKeyConstraintError) {
    // "child": the category, brand or attribute sent in the body doesn't exist
    if (error.reltype === "child") {
      const field = error.fields?.[0] ?? "category_id, brand_id or attribute_id";
      return res.status(400).json({ message: `${field} does not exist` });
    }
    // "parent": sales or orders still point at this product
    return res.status(409).json({
      message: "Product is in use and cannot be deleted. Set active to false instead",
    });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: productIncludes,
      order: [["product_id", "ASC"]],
    });
    res.json({ data: products });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const fields = pickProductFields(req.body);
    const invalid = validateProductFields(fields, { isCreate: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const product = await Product.create(fields);
    res.status(201).json({ data: await findProductById(product.product_id) });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = pickProductFields(req.body);
    const invalid = validateProductFields(fields, { isCreate: false });
    if (invalid) return res.status(400).json({ message: invalid });

    await product.update(fields);
    // reload so the included category/brand/attribute match any changed ids
    res.json({ data: await findProductById(product.product_id) });
  } catch (error) {
    handleError(res, error);
  }
};

// named "remove" because "delete" is a reserved word in JS
const remove = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { product_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, create, update, remove };
