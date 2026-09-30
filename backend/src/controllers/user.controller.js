const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { User } = require("../models");

// Same values as the chk_user_role CHECK constraint on tbl_user
const ROLES = ["admin", "supervisor", "staff"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimText = (value) => (typeof value === "string" ? value.trim() : value);

// Only these columns can be set from the request body.
// Keys that are not sent are left out so an update doesn't overwrite them.
const pickUserFields = ({
  username,
  password,
  email,
  full_name,
  role,
  store_id,
  active,
} = {}) => {
  const fields = {
    username: trimText(username),
    password, // not trimmed: spaces can be part of a password
    email: trimText(email),
    full_name: trimText(full_name),
    role,
    store_id,
    active,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  );
};

// Max lengths match the tbl_user columns. Checking them here returns a 400
// instead of MySQL cutting the text off or failing.
const checkRequiredText = (name, value, maxLength) => {
  if (typeof value !== "string" || !value) return `${name} is required`;
  if (value.length > maxLength) {
    return `${name} must be at most ${maxLength} characters`;
  }
  return null;
};

const validateUserFields = (fields, { isCreate }) => {
  // On create every required field is checked; on update only the ones sent
  const shouldCheck = (key) => isCreate || key in fields;
  const { username, password, email, full_name, role, store_id, active } =
    fields;

  if (shouldCheck("username")) {
    const error = checkRequiredText("username", username, 50);
    if (error) return error;
  }
  if (shouldCheck("email")) {
    // length is checked first so the pattern never runs on very long input
    const error = checkRequiredText("email", email, 100);
    if (error) return error;
    if (!EMAIL_PATTERN.test(email)) return "email must be a valid email address";
  }
  if (
    shouldCheck("password") &&
    (typeof password !== "string" || password.length < 8)
  ) {
    return "password must be at least 8 characters";
  }
  if (shouldCheck("role") && !ROLES.includes(role)) {
    return `role must be one of: ${ROLES.join(", ")}`;
  }
  if (
    full_name != null &&
    (typeof full_name !== "string" || full_name.length > 100)
  ) {
    return "full_name must be text of at most 100 characters";
  }
  if (store_id != null && !(Number.isInteger(store_id) && store_id > 0)) {
    return "store_id must be a positive whole number";
  }
  if (active !== undefined && typeof active !== "boolean") {
    return "active must be true or false";
  }
  return null;
};

const handleError = (res, error) => {
  // UniqueConstraintError extends ValidationError, so check it first
  if (error instanceof UniqueConstraintError) {
    // path is the column that already has this value: username or email
    const field = error.errors[0]?.path ?? "username or email";
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      message: "User is in use and cannot be deleted. Set active to false instead",
    });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["user_id", "ASC"]],
    });
    res.json({ data: users });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const fields = pickUserFields(req.body);
    const invalid = validateUserFields(fields, { isCreate: true });
    if (invalid) return res.status(400).json({ message: invalid });

    const user = await User.create(fields);
    res.status(201).json({ data: user });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fields = pickUserFields(req.body);
    const invalid = validateUserFields(fields, { isCreate: false });
    if (invalid) return res.status(400).json({ message: invalid });

    await user.update(fields);
    res.json({ data: user });
  } catch (error) {
    handleError(res, error);
  }
};

// named "remove" because "delete" is a reserved word in JS
const remove = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { user_id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, create, update, remove };
