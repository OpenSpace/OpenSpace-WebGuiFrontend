import React from 'react';

import { copyTextToClipboard } from '../../../utils/helpers';
import InfoBox from '../../common/InfoBox/InfoBox';

export default function PropertyLabel({ description }) {
  function copyUri() {
    copyTextToClipboard(description.Identifier);
  }

  return (
    <span onClick={copyUri}>
      { description.Name }
      {' '}
      {description && <InfoBox text={description.description} />}
    </span>
  );
}
