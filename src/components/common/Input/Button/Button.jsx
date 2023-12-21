import React from 'react';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../../utils/helpers';

import styles from './Button.scss';

const Button = React.forwardRef((props, ref) => {
  const specialClasses = 'onClick block small transparent uppercase smalltext nopadding largetext regular wide noChangeOnActive';
  const inheritProps = excludeKeys(props, specialClasses);

  const extraClass = specialClasses.split(' ')
    .filter((c) => props[c])
    .map((c) => styles[c])
    .join(' ');

  function onClick(evt) {
    props.onClick(evt);
    evt.currentTarget.blur();
    evt.stopPropagation();
  }

  return (
    <button
      {...inheritProps}
      className={`${styles.button} ${props.className} ${extraClass}`}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      { props.children }
    </button>
  );
});

Button.propTypes = {
  block: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  noChangeOnActive: PropTypes.bool,
  nopadding: PropTypes.bool,
  onClick: PropTypes.func,
  small: PropTypes.bool,
  smalltext: PropTypes.bool,
  transparent: PropTypes.bool,
  uppercase: PropTypes.bool,
  regular: PropTypes.bool,
  wide: PropTypes.bool
};

Button.defaultProps = {
  block: false,
  className: '',
  noChangeOnActive: false,
  nopadding: false,
  onClick: () => {},
  small: false,
  smalltext: false,
  transparent: false,
  uppercase: false,
  regular: false,
  wide: false
};

export default Button;
