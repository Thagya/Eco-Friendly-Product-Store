// src/utils/validators.js
import { PRODUCT_CONFIG } from "./constants";

// Custom Error
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// --- Generic Validators ---
export const required = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return true;
};

export const email = (value) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !regex.test(value)) {
    throw new ValidationError("Invalid email address");
  }
  return true;
};

export const password = (value) => {
  if (value.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    throw new ValidationError("Password must include uppercase, lowercase & number");
  }
  return true;
};

export const username = (value) => {
  if (value.length < 3) throw new ValidationError("Username must be at least 3 chars");
  if (value.length > 20) throw new ValidationError("Username max 20 chars");
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    throw new ValidationError("Username can only contain letters, numbers & underscores");
  }
  return true;
};

export const url = (value) => {
  if (value) {
    try {
      new URL(value);
    } catch {
      throw new ValidationError("Invalid URL");
    }
  }
  return true;
};

export const number = (value, min = null, max = null) => {
  if (value === "" || value === null || value === undefined) return true;
  const num = Number(value);
  if (isNaN(num)) throw new ValidationError("Enter a valid number");
  if (min !== null && num < min) throw new ValidationError(`Min value ${min}`);
  if (max !== null && num > max) throw new ValidationError(`Max value ${max}`);
  return true;
};

export const integer = (value, min = null, max = null) => {
  if (value === "" || value === null || value === undefined) return true;
  const num = Number(value);
  if (!Number.isInteger(num)) throw new ValidationError("Enter a valid integer");
  if (min !== null && num < min) throw new ValidationError(`Min value ${min}`);
  if (max !== null && num > max) throw new ValidationError(`Max value ${max}`);
  return true;
};

export const stringLength = (value, min = null, max = null, field = "This field") => {
  if (!value) return true;
  const len = value.length;
  if (min && len < min) throw new ValidationError(`${field} must be ≥ ${min} chars`);
  if (max && len > max) throw new ValidationError(`${field} must be ≤ ${max} chars`);
  return true;
};

// --- Product Specific ---
export const productName = (value) => {
  required(value, "Product name");
  stringLength(value, 2, PRODUCT_CONFIG.MAX_NAME_LENGTH, "Product name");
  return true;
};

export const productDescription = (value) => {
  required(value, "Product description");
  stringLength(value, 10, PRODUCT_CONFIG.MAX_DESCRIPTION_LENGTH, "Product description");
  return true;
};

export const productPrice = (value) => {
  required(value, "Product price");
  number(value, PRODUCT_CONFIG.MIN_PRICE, PRODUCT_CONFIG.MAX_PRICE);
  return true;
};

export const productStock = (value) => {
  required(value, "Product stock");
  integer(value, 0, 99999);
  return true;
};

export const productCategory = (value) => {
  required(value, "Product category");
  return true;
};

export const productImage = (value) => {
  if (value) url(value);
  return true;
};

// --- Cart ---
export const cartQuantity = (value) => {
  required(value, "Quantity");
  integer(value, 1, 99);
  return true;
};

// --- Form Helper ---
export const validateForm = (data, rules) => {
  const errors = {};
  for (const [field, checks] of Object.entries(rules)) {
    const value = data[field];
    try {
      checks.forEach((rule) => rule(value));
    } catch (err) {
      if (err instanceof ValidationError) errors[field] = err.message;
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

// --- Schemas ---
export const schemas = {
  login: {
    username: [required, username],
    password: [required]
  },
  register: {
    username: [required, username],
    password: [required, password]
  },
  product: {
    name: [productName],
    description: [productDescription],
    price: [productPrice],
    stock: [productStock],
    category: [productCategory],
    image: [productImage]
  },
  addToCart: {
    quantity: [cartQuantity]
  }
};
