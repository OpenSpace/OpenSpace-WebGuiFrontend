import React from 'react';
import PropTypes from 'prop-types';

import InfoBox from '../../common/InfoBox/InfoBox';

function PropertyLabel({ description }) {
  return (
    <span>
      { description.Name }
      {' '}
      {description && <InfoBox text={description.description} />}
    </span>
  );
}

PropertyLabel.propTypes = {
  description: PropTypes.shape({
    Name: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default PropertyLabel;
