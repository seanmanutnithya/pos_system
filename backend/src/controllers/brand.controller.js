const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { Brand } = require("@models");

// Only these columns can be set from the request body.
// Keys that are not sent are left out so an update doesn't overwrite them.
const pickBrandFields = ({ brand_name, description, active } = {}) => {
  const fields = {};
  if (brand_name !== undefined) {
    fields.brand_name =
      typeof brand_name === "string" ? brand_name.trim() : brand_name;
  }
  if (description !== undefined) fields.description = description;
  if (active !== undefined) fields.active = active;
  return fields;
};

// Max lengths match the tbl_brand columns. Checking them here returns a 400
// instead of MySQL cutting the text off.
const validateBrandFields = (fields, { isCreate }) => {
  if (isCreate || "brand_name" in fields) {
    if (typeof fields.brand_name !== "string" || !fields.brand_name) {
      return "brand_name is required";
    }
    if (fields.brand_name.length > 100) {
      return "brand_name must be at most 100 characters";
    }
  }
  if (
    fields.description != null &&
    (typeof fields.description !== "string" || fields.description.length > 500)
  ) {
    return "description must be text of at most 500 characters";
  }
  if ("active" in fields && typeof fields.active !== "boolean") {
    return "active must be true or false";
  }
  return null;
};

const handleError = (res, error) => {
  // UniqueConstraintError extends ValidationError, so check it first
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "brand_name already exists" });
  }
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res
      .status(409)
      .json({ message: "Brand is in use and cannot be deleted" });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const getAll = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [["brand_id", "ASC"]],
    });
    res.json({ data: brands });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const fields = pickBrandFields(req.body);
    const invalid = validateBrandFields(fields, { isCreate: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const brand = await Brand.create(fields);
    res.status(201).json({ data: brand });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const fields = pickBrandFields(req.body);
    const invalid = validateBrandFields(fields, { isCreate: false });
    if (invalid) return res.status(400).json({ message: invalid });

    await brand.update(fields);
    res.json({ data: brand });
  } catch (error) {
    handleError(res, error);
  }
};

// named "remove" because "delete" is a reserved word in JS
const remove = async (req, res) => {
  try {
    const deleted = await Brand.destroy({
      where: { brand_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, create, update, remove };
