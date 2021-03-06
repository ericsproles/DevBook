import Validator from 'validator';
import isEmpty from './is-empty';

export default function validateExperienceInput(data) {
  const errors = {};
  data.school = !isEmpty(data.school) ? data.school : ``;
  data.degree = !isEmpty(data.degree) ? data.degree : ``;
  data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : ``;
  data.from = !isEmpty(data.from) ? data.from : ``;

  if (Validator.isEmpty(data.school)) {
    errors.school = `School is required`;
  }
  if (Validator.isEmpty(data.degree)) {
    errors.degree = `Degree field is required`;
  }
  if (Validator.isEmpty(data.fieldOfStudy)) {
    errors.fieldOfStudy = `Field of Study field is required`;
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = `From date is required`;
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
