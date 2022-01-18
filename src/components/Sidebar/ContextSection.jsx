import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavigationAimKey, NavigationAnchorKey, ScenePrefixKey } from '../../api/keys';
import PropertyOwner from './Properties/PropertyOwner';

class ContextSection extends Component {
  render() {
    const focusOrAnchor = this.props.aim ? "Anchor" : "Focus";
    return <>
      {this.props.anchor &&
        <PropertyOwner expansionIdentifier={this.props.expansionIdentifier + '/anchor'}
                       name={"Current " + focusOrAnchor + ": " + this.props.anchorName}
                       uri={this.props.anchor}
                       autoExpand={true} />
      }
      {this.props.aim &&
        <PropertyOwner expansionIdentifier={this.props.expansionIdentifier + '/aim'}
                       name={"Current Aim: " + this.props.aimName}
                       uri={this.props.aim}
                       autoExpand={true} />
      }
    </>
  }
}

ContextSection.propTypes = {
};

ContextSection.defaultProps = {
};

const mapStateToProps = state => {
  const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
  const aimProp = state.propertyTree.properties[NavigationAimKey];

  const anchor = anchorProp &&
                 anchorProp.value !== '' &&
                 (ScenePrefixKey + anchorProp.value);

  const aim = aimProp &&
              aimProp.value !== '' &&
              (ScenePrefixKey + aimProp.value);

  let anchorName = "";
  if (anchor) {
    const anchorNode = state.propertyTree.propertyOwners[anchor];
    anchorName = anchorNode ? anchorNode.name : anchor;
  }

  let aimName = "";
  if (aim) {
    const aimNode = state.propertyTree.propertyOwners[aim];
    aimName = aimNode ? aimNode.name : aim;
  }

  return {
    anchor,
    anchorName,
    aim,
    aimName
  };
}

ContextSection = connect(
  mapStateToProps,
)(ContextSection);

export default ContextSection;
