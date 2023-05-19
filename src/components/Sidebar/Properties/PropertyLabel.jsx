import React from 'react';
import InfoBox from "../../common/InfoBox/InfoBox";
import { copyTextToClipboard } from '../../../utils/helpers';

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