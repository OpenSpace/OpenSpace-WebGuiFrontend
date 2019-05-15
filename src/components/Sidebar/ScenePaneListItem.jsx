import React, { Component } from 'react';
import PropertyOwner from './Properties/PropertyOwner';
import Shortcut from './Shortcut';
import Group from './Group';
import ContextSection from './ContextSection';

class ScenePaneListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;

    const isGroup = props.path !== undefined;
    const isPropertyOwner = props.uri !== undefined;
    const isShortcut = false; // TODO: support shortcuts.

    if (props.type === 'group') {
      return <Group key={this.props.path}
                    path={this.props.path}
                    expansionIdentifier={'scene/' + this.props.path} />;
    }
    if (props.type === 'context') {
      return <ContextSection expansionIdentifier="context" />;
    }
    if (props.type === 'propertyOwner') {
      return <PropertyOwner
              key={this.props.uri}
              uri={this.props.uri}
              expansionIdentifier={'scene-search/' + this.props.uri} />
    }

    /*
    if (this.props.subowners != null) {
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
    */
    return <li>{JSON.stringify(this.props)}</li>;
  }


}

export default ScenePaneListItem;
