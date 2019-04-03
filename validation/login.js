import isEmpty from './is-empty';

const Validator = require(`validator`);

export function validateLoginInput(data) {
  const errors = {};
  data.email = !isEmpty(data.email) ? data.email : ``;
  data.password = !isEmpty(data.password) ? data.password : ``;

  console.log(`data.name = `, data.name);

  if (!Validator.isEmail(data.email)) {
    errors.email = `Email is invalid`;
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = `Email is required`;
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = `Password is required`;
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

module.exports = validateLoginInput;
