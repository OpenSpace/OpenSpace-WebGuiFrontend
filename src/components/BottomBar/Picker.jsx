import PropTypes from 'prop-types';
import React from 'react';
import { useTutorial } from '../GettingStartedTour/GettingStartedContext';
import styles from './Picker.scss';

const Picker = ({children, className, refKey, ...props}) => {
  const refs = useTutorial();
  return (
    <div ref={refKey ? el => refs.current[refKey] = el : null} {...props} className={`${styles.Picker} ${className}`}>
      { children }
    </div>
  );
};

Picker.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Picker.defaultProps = {
  className: '',
};

Picker.Active = styles.Active;
Picker.Name = styles.Name;
Picker.Popover = styles.Popover;
Picker.Title = styles.Title;
Picker.Wrapper = styles.Wrapper;
Picker.Window = styles.Window;

Picker.DisabledBlue = styles.DisabledBlue;
Picker.DisabledOrange = styles.DisabledOrange;
Picker.Blue = styles.Blue;
Picker.Orange = styles.Orange;
Picker.Red = styles.Red;

export default Picker;
