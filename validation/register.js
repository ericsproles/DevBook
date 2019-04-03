import isEmpty from './is-empty';

const Validator = require(`validator`);

export function validateRegisterInput(data) {
  const errors = {};
  data.name = !isEmpty(data.name) ? data.name : ``;
  data.email = !isEmpty(data.email) ? data.email : ``;
  data.password = !isEmpty(data.password) ? data.password : ``;
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : ``;

  console.log(`data.name = `, data.name);

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = `Name must be between 2 and 30 characters`;
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = `Name is required`;
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = `Email is required`;
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = `Email is invalid`;
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = `Password is required`;
  }
  if (!Validator.isLength(data.password, { min: 6, max: 20 })) {
    errors.password = `Password must be at least 6 characters`;
  }
  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = `Confirm password field is required`;
  }
  if (!Validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = `Passwords must match!`;
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

module.exports = validateRegisterInput;
