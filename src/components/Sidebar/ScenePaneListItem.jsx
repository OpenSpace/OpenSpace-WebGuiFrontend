import React, { Component } from 'react';
import ContextSection from './ContextSection';
import Group from './Group';
import PropertyOwner from './Properties/PropertyOwner';

class ScenePaneListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { props } = this;

    if (props.type === 'group') {
      return (
        <Group
          path={this.props.path}
          expansionIdentifier={`scene/${this.props.path}`}
        />
      );
    }
    if (props.type === 'context') {
      return <ContextSection expansionIdentifier="context" />;
    }
    if (props.type === 'propertyOwner') {
      return (
        <PropertyOwner
          uri={this.props.uri}
          expansionIdentifier={`scene-search/${this.props.uri}`}
        />
      );
    }
    return null;
  }
}

export default ScenePaneListItem;
