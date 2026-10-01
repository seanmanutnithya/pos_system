const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { Category } = require("@models");

// Only these columns can be set from the request body.
// Keys that are not sent are left out so an update doesn't overwrite them.
const pickCategoryFields = ({ category_name, description, active } = {}) => {
  const fields = {};
  if (category_name !== undefined) {
    fields.category_name =
      typeof category_name === "string" ? category_name.trim() : category_name;
  }
  if (description !== undefined) fields.description = description;
  if (active !== undefined) fields.active = active;
  return fields;
};

const validateCategoryFields = (fields, { isCreate }) => {
  if (isCreate || "category_name" in fields) {
    if (typeof fields.category_name !== "string" || !fields.category_name) {
      return "category_name is required";
    }
  }
  if ("active" in fields && typeof fields.active !== "boolean") {
    return "active must be true or false";
  }
  return null;
};

const handleError = (res, error) => {
  // UniqueConstraintError extends ValidationError, so check it first
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "category_name already exists" });
  }
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res
      .status(409)
      .json({ message: "Category is in use and cannot be deleted" });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["category_id", "ASC"]],
    });
    res.json({ data: categories });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const fields = pickCategoryFields(req.body);
    const invalid = validateCategoryFields(fields, { isCreate: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const category = await Category.create(fields);
    res.status(201).json({ data: category });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const fields = pickCategoryFields(req.body);
    const invalid = validateCategoryFields(fields, { isCreate: false });
    if (invalid) return res.status(400).json({ message: invalid });

    await category.update(fields);
    res.json({ data: category });
  } catch (error) {
    handleError(res, error);
  }
};

// named "remove" because "delete" is a reserved word in JS
const remove = async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { category_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, create, update, remove };
