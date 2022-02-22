import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import buttonStyle from './../style/UtilitiesButtons.scss';

const ScaleController = props =>
  (
    <div
      onClick={props.onChangeScale}
      className={`${buttonStyle.UtilitiesButton} ${props.scale !== 1 && buttonStyle.active}`}
      role="button"
      tabIndex="0"
    >
      <span style={{ fontSize: '1.5em' }}>{props.scale}x</span>
      <SmallLabel>{props.info}</SmallLabel>
    </div>
  );

ScaleController.propTypes = {
  onChangeScale: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  info: PropTypes.string.isRequired,
};

export default ScaleController;
