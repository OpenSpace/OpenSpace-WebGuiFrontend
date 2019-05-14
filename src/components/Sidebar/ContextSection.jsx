import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner from './Properties/PropertyOwner'

import { setPropertyTreeExpansion } from '../../api/Actions';
import { NavigationAnchorKey, NavigationAimKey, ScenePrefixKey } from '../../api/keys'
import { connect } from 'react-redux';

class ContextSection extends Component {
  render() {
    const focusOrAnchor = this.props.aim ? "Anchor" : "Focus";
    return <>
      {this.props.anchor &&
        <PropertyOwner name={"Current " + focusOrAnchor + ": " + this.props.anchorName}
                       uri={this.props.anchor}/>
      }
      {this.props.aim &&
        <PropertyOwner name={"Current Aim: " + this.props.aimName}
                       uri={this.props.aim}/>
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
