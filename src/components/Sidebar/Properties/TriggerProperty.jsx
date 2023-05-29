import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';

import PropertyLabel from './PropertyLabel';

function TriggerProperty({ description, dispatcher }) {
  function onChange() {
    dispatcher.set(null);
  }

  // Remove the name of the property popup because the info
  // popup should appear outside of the Button
  const noNameDescription = { ...description };
  noNameDescription.Name = '';
  return (
    <div style={{ marginBottom: 3 }}>
      <Button onClick={onChange}>
        { description.Name }
      </Button>
      <PropertyLabel description={noNameDescription} />
    </div>
  );
}

TriggerProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired
};

export default TriggerProperty;
