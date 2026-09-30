const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { Attribute } = require("../models");

const trimText = (value) => (typeof value === "string" ? value.trim() : value);

// Only these columns can be set from the request body.
// Keys that are not sent are left out so an update doesn't overwrite them.
const pickAttributeFields = ({ attribute_name, attribute_value, active } = {}) => {
  const fields = {};
  if (attribute_name !== undefined) fields.attribute_name = trimText(attribute_name);
  if (attribute_value !== undefined) fields.attribute_value = trimText(attribute_value);
  if (active !== undefined) fields.active = active;
  return fields;
};

// Max lengths match the tbl_attribute columns. Checking them here returns a 400
// instead of MySQL cutting the text off.
const checkRequiredText = (name, value, maxLength) => {
  if (typeof value !== "string" || !value) return `${name} is required`;
  if (value.length > maxLength) {
    return `${name} must be at most ${maxLength} characters`;
  }
  return null;
};

const validateAttributeFields = (fields, { isCreate }) => {
  if (isCreate || "attribute_name" in fields) {
    const error = checkRequiredText("attribute_name", fields.attribute_name, 50);
    if (error) return error;
  }
  if (isCreate || "attribute_value" in fields) {
    const error = checkRequiredText("attribute_value", fields.attribute_value, 100);
    if (error) return error;
  }
  if ("active" in fields && typeof fields.active !== "boolean") {
    return "active must be true or false";
  }
  return null;
};

const handleError = (res, error) => {
  // UniqueConstraintError extends ValidationError, so check it first
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: "This attribute_name and attribute_value pair already exists",
    });
  }
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      message: "Attribute is in use and cannot be deleted. Set active to false instead",
    });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const getAll = async (req, res) => {
  try {
    const attributes = await Attribute.findAll({
      order: [["attribute_id", "ASC"]],
    });
    res.json({ data: attributes });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const fields = pickAttributeFields(req.body);
    const invalid = validateAttributeFields(fields, { isCreate: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const attribute = await Attribute.create(fields);
    res.status(201).json({ data: attribute });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const attribute = await Attribute.findByPk(req.params.id);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    const fields = pickAttributeFields(req.body);
    const invalid = validateAttributeFields(fields, { isCreate: false });
    if (invalid) return res.status(400).json({ message: invalid });

    await attribute.update(fields);
    res.json({ data: attribute });
  } catch (error) {
    handleError(res, error);
  }
};

// named "remove" because "delete" is a reserved word in JS
const remove = async (req, res) => {
  try {
    const deleted = await Attribute.destroy({
      where: { attribute_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    res.json({ message: "Attribute deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, create, update, remove };
