import React from 'react';
import PropTypes from 'prop-types';

import InfoBox from '../../common/InfoBox/InfoBox';

function PropertyLabel({ metaData }) {
  return (
    <span>
      {metaData.guiName} {metaData && <InfoBox text={metaData.description} />}
    </span>
  );
}

PropertyLabel.propTypes = {
  metaData: PropTypes.shape({
    guiName: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default PropertyLabel;
