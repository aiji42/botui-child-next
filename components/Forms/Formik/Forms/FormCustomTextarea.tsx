import { FC } from 'react';
import { withFormik, Field, ErrorMessage, FormikProps } from 'formik';
import * as yup from 'yup';
import SpanErrorMessage from '../Elements/SpanErrorMessage';
import ButtonSubmit from '../Elements/ButtonSubmit';
import TextareaWithIcon from '../Elements/TextareaWithIcon';
import { customYup, customHandleSubmit } from './modules'
import { FormCustomTextareaValues, FormCustomTextarea as FormCustomTextareaType } from '../../../../@types/form';

const Form: FC<FormikProps<FormCustomTextareaValues> & FormCustomTextareaType> = (props) => {
  const { name, title, placeholder, handleSubmit } = props;

  return (
    <form onSubmit={handleSubmit}>
      <Field as={TextareaWithIcon} name={name} title={title} placeholder={placeholder} autoFocus />
      <ErrorMessage name={name} component={SpanErrorMessage} />
      <Field component={ButtonSubmit} name="submit" />
    </form>
  );
};

const FormCustomTextarea = withFormik<FormCustomTextareaType, FormCustomTextareaValues>({
  mapPropsToValues: ({ name }: FormCustomTextareaType) => ({ [name]: '' }),
  validationSchema: (props: FormCustomTextareaType) => yup.object().shape<object>(customYup(props)),
  validateOnMount: true,
  handleSubmit: customHandleSubmit,
})(Form);

export default FormCustomTextarea;