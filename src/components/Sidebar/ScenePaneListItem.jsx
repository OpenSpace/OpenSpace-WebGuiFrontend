import React, { Component } from 'react';
import PropertyOwner from './Properties/PropertyOwner';
import Shortcut from './Shortcut';

class ScenePaneListItem extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      var item = this.props;
      const getMarkup = (propertyOwnerOrShortcut) => {
        if (item.subowners != null) {
          return <PropertyOwner
                  {...propertyOwnerOrShortcut}
                  key={propertyOwnerOrShortcut.identifier}
                  onClick={this.props.onSelect}
                  active={this.props.active}
               />
        } else {
          return <Shortcut
                  {...propertyOwnerOrShortcut}
                  key={propertyOwnerOrShortcut.identifier}
                  onClick={this.props.onSelect}
                  active={this.props.active}
                />
        }
      };

      return (
        getMarkup(item)
      );
    }
}

export default ScenePaneListItem;
