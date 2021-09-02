import React, { Component } from 'react';
import PropertyOwner from './Properties/PropertyOwner';
import Group from './Group';
import ContextSection from './ContextSection';

class ScenePaneListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;

    if (props.type === 'group') {
      return <Group path={this.props.path}
                    expansionIdentifier={'scene/' + this.props.path} />;
    }
    if (props.type === 'context') {
      return <ContextSection expansionIdentifier="context" />;
    }
    if (props.type === 'propertyOwner') {
      return <PropertyOwner
              uri={this.props.uri}
              expansionIdentifier={'scene-search/' + this.props.uri} />
    }
    return null;
  }
}

export default ScenePaneListItem;
