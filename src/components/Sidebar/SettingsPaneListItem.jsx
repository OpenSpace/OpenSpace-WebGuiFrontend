import React from 'react';

import { removeLastWordFromUri } from '../../utils/propertyTreeHelpers';

import Property from './Properties/Property';
import PropertyOwner from './Properties/PropertyOwner';

import styles from './SettingsPaneListItem.scss';

function SettingsPaneListItem({
  type, uri, index
}) {
  if (type === 'subPropertyOwner') {
    return (
      <div className={styles.propertyItemGroup}>
        <p>{removeLastWordFromUri(uri)}</p>
        <PropertyOwner
          uri={uri}
          expansionIdentifier={`scene-search/${uri}`}
        />
      </div>
    );
  }
  if (type === 'propertyOwner') {
    return (
      <PropertyOwner
        uri={uri}
        expansionIdentifier={`scene-search/${uri}`}
      />
    );
  }
  if (type === 'property') {
    return (
      <div className={styles.propertyItemGroup}>
        <p>{removeLastWordFromUri(uri)}</p>
        <Property index={index} key={uri} uri={uri} />
      </div>
    );
  }
  return null;
}

export default SettingsPaneListItem;
