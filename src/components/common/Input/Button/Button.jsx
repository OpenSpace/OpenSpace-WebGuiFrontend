import React from 'react';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../../utils/helpers';

import styles from './Button.scss';

/* eslint-disable react/no-unused-prop-types */

const Button = React.forwardRef((props, refs) => {
  const specialClasses = 'onClick block small transparent uppercase smalltext nopadding largetext';
  const inheritProps = excludeKeys(props, specialClasses);

  const extraClass = specialClasses.split(' ')
    .filter((c) => props[c])
    .map((c) => styles[c])
    .join(' ');

  let buttonElement = null;

  const onClick = (evt) => {
    props.onClick(evt);
    if (buttonElement) {
      buttonElement.blur();
    }
  };

  const ref = (domElement) => {
    buttonElement = domElement;
    if (refs && typeof refs === 'function') {
      refs(domElement);
    }
  };

  return (
    <button
      {...inheritProps}
      className={`${props.className} ${extraClass} ${styles.button}`}
      onClick={onClick}
      ref={ref}
    >
      { props.children }
    </button>
  );
});

Button.propTypes = {
  block: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  nopadding: PropTypes.bool,
  onClick: PropTypes.func,
  small: PropTypes.bool,
  smalltext: PropTypes.bool,
  transparent: PropTypes.bool,
  uppercase: PropTypes.bool
};

Button.defaultProps = {
  block: false,
  className: '',
  nopadding: false,
  onClick: () => {},
  small: false,
  smalltext: false,
  transparent: false,
  uppercase: false
};

export default Button;
