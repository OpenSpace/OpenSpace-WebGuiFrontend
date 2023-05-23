import React from 'react';

import InfoBox from '../../common/InfoBox/InfoBox';

export default function PropertyLabel({ description }) {
  return (
    <span>
      { description.Name }
      {' '}
      {description && <InfoBox text={description.description} />}
    </span>
  );
}
