import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';

import PropertyLabel from './PropertyLabel';

function TriggerProperty({ metaData, dispatcher }) {
  function onChange() {
    dispatcher.set(null);
  }

  // Remove the name of the property popup because the info
  // popup should appear outside of the Button
  const noNameDescription = { ...metaData };
  noNameDescription.guiName = '';
  return (
    <div style={{ marginBottom: 3 }}>
      <Button onClick={onChange}>{metaData.guiName}</Button>
      <PropertyLabel metaData={noNameDescription} />
    </div>
  );
}

TriggerProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired
};

export default TriggerProperty;
