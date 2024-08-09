import React from 'react';
import PropTypes from 'prop-types';

import { removeLastWordFromUri } from '../../utils/propertyTreeHelpers';

import Property from './Properties/Property';
import PropertyOwner from './Properties/PropertyOwner';

import styles from './SettingsPaneListItem.scss';

function SettingsPaneListItem({ type, uri }) {
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
        <Property key={uri} uri={uri} />
      </div>
    );
  }
  return null;
}

SettingsPaneListItem.propTypes = {
  type: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired
};

SettingsPaneListItem.defaultProps = {};

export default SettingsPaneListItem;
