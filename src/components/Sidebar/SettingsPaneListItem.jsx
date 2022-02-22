import React, { Component } from 'react';
import { removeLastWordFromUri } from '../../utils/propertyTreeHelpers';
import Property from './Properties/Property';
import PropertyOwner from './Properties/PropertyOwner';
import styles from './SettingsPaneListItem.scss';

class SettingsPaneListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;

    if (props.type === 'subPropertyOwner') {
      return (
        <div className={styles.propertyItemGroup}>
          <p>{removeLastWordFromUri(this.props.uri)}</p>
          <PropertyOwner
              uri={this.props.uri}
              expansionIdentifier={'scene-search/' + this.props.uri} />
        </div>
      );
    }
    if (props.type === 'propertyOwner') {
      return <PropertyOwner
              uri={this.props.uri}
              expansionIdentifier={'scene-search/' + this.props.uri} />
    }
    if (props.type === 'property') {
      return (
        <div className={styles.propertyItemGroup}>
          <p>{removeLastWordFromUri(this.props.uri)}</p>
          <Property index={this.props.index} key={this.props.uri} uri={this.props.uri}/>
        </div>
      );
    }
    return null;
  }
}

export default SettingsPaneListItem;
