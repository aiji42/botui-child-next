import React from 'react';
import { withFormik, Field, ErrorMessage } from 'formik';
import { formPropTypes } from '../PropTypes';
import * as yup from 'yup';
import { dataStore, saveStoreValue } from '../../../../dataStore';
import InputNumber from '../Elements/InputNumber';
import SpanErrorMessage from '../Elements/SpanErrorMessage';
import ButtonSubmit from '../Elements/ButtonSubmit';
import { isValidNumber as isValidPhoneNumber } from 'libphonenumber-js';

const form = (props) => {
  const { handleSubmit } = props;

  return (
    <form onSubmit={handleSubmit}>
      <Field component={InputNumber} name="tel" placeholder="09012345678" title="電話番号(ハイフン無し)" autoFocus />
      <ErrorMessage name="tel" component={SpanErrorMessage} />

      <Field component={ButtonSubmit} />
    </form>
  );
};

form.propTypes = {
  ...formPropTypes
};

const FormTel = withFormik({
  mapPropsToValues: () => ({
    tel: ''
  }),
  validationSchema: yup.object().shape({
    tel: yup.string()
      .matches(/^(0{1}\d{9,10})$/, '半角数字で正しく入力してください')
      .test('tel-format', '半角数字で正しく入力してください', (value) => value ? isValidPhoneNumber(value, 'JP') : false)
  }),
  validateOnMount: true,
  handleSubmit: (values, { props, setSubmitting }) => {
    if (Object.keys(values).every(key => dataStore[key] !== null)) props.onUpdate();
    Object.keys(values).forEach(key => saveStoreValue(key, values[key]));
    Object.keys(values).forEach(key => dataStore[key] = values[key]);
    props.onSubmited();
    setSubmitting(false);
  },
})(form);

export default FormTel;