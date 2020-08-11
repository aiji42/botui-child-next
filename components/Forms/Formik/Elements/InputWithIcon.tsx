import React, { FC, useEffect, useRef, MutableRefObject, InputHTMLAttributes, ReactNode } from 'react';
import { useField, FieldMetaProps } from 'formik'
import { css, SerializedStyles } from '@emotion/core';
import { okColor, errorColor, baseBorderColor } from '../../shared/baseStyle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const style = {
  base: css`
    padding: 8px 25px 8px 8px;
    border-radius: 3px;
    background-color: #ffffff;
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    font-size: 1.05em;
    box-sizing: border-box;
    &:focus {
      border-left-width 5px;
      transition: all 300ms 0s ease;
    }
  `,
  title: css`
    font-size: 0.9em;
    line-height: 1;
    padding-top: 6px;
    padding-bottom: 4px;
  `,
  isOk: css`
    border: solid 2px ${okColor};
  `,
  noTouched: css`
    border: solid 2px ${baseBorderColor};
  `,
  withError: css`
    border: solid 2px ${errorColor};
  `,
  okIcon: css`
    float: right;
    position: relative;
    right: 5px;
    top: -31px;
    color: ${okColor};
    height: 0px;
  `
}

const styles = ({ error, touched, initialValue }: FieldMetaProps<any>): SerializedStyles | SerializedStyles[] => {
  if (!error) return [style.base, style.isOk];
  if (!touched && error && initialValue.length === 0) return [style.base, style.noTouched];
  if (error) return [style.base, style.withError];
  return style.base
};

export type InputWithIconProps = {
  name: string
  title: string | ReactNode
  autoFocus?: boolean
  innerRef?: MutableRefObject<HTMLInputElement>
} & InputHTMLAttributes<Element>

const InputWithIcon: FC<InputWithIconProps> = ({ name, innerRef, autoFocus, title, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [field, meta] = useField(name)
  const { error } = meta

  useEffect(() => {
    if (!autoFocus) return;
    if (innerRef) innerRef.current.focus();
    else ref.current?.focus();
  }, []);

  return (
    <>
      <div css={style.title}>{title}</div>
      <input {...field} {...props} ref={innerRef || ref} css={styles(meta)} />
      {!error &&
        <div css={style.okIcon}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
      }
    </>
  );
};

InputWithIcon.defaultProps = {
  autoFocus: false
};

export default InputWithIcon;