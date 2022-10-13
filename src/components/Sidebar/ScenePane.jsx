import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import subStateToProps from '../../utils/subStateToProps';
import {FilterList, FilterListData, FilterListFavorites} from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import Pane from './Pane';
import ContextSection from './ContextSection';
import PropertyOwner from './Properties/PropertyOwner';
import Group from './Group';
import { isPropertyOwnerHidden } from '../../utils/propertyTreeHelpers';
import Button from '../common/Input/Button/Button';
import Tooltip from '../common/Tooltip/Tooltip';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import styles from './ScenePane.scss';
import { InputButton } from '../common/FilterList/FilterList';
import Checkbox from '../common/Input/Checkbox/Checkbox';

class ScenePane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyEnabled: false,
      showSearchSettings: false
    };
  }

  render() {
    const entries = this.props.propertyOwners.map(uri => ({
      key: uri,
      uri: uri,
      expansionIdentifier: 'scene-search/' + uri
    }));

    const favorites = this.props.groups.map(item => ({
      key: item,
      path: item,
      expansionIdentifier: 'scene/' + item 
    }));

    const { matcher, onlyEnabledMatcher } = this.props;
    const settingsButton =<>
      <InputButton
        onClick={() => this.setState({ showSearchSettings: !this.state.showSearchSettings })}
        className={styles.settings}
      >
        <MaterialIcon icon="settings" className="small" />
      </InputButton>
      {this.state.showSearchSettings &&
        <Tooltip placement={'right'} className={styles.toolTip}>
          <Checkbox
            label="Show Only Enabled"
            checked={this.state.showOnlyEnabled}
            left={false}
            disabled={false}
            setChecked={() => this.setState({ showOnlyEnabled: !this.state.showOnlyEnabled })}
            wide
          />
        </Tooltip>}
    </>;

    return (
      <Pane title="Scene" closeCallback={this.props.closeCallback}>
        { (entries.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}
        {entries.length > 0 && (
          <>

            <FilterList matcher={this.state.showOnlyEnabled ? onlyEnabledMatcher : matcher} customButton={settingsButton} >
              <FilterListFavorites>
                <ContextSection expansionIdentifier="context" />
                {favorites.map(favorite => <Group {...favorite} />)}
              </FilterListFavorites>
              <FilterListData>
                {entries.map(entry => <PropertyOwner {...entry} />)}
              </FilterListData>
            </FilterList> 
          </>
        )}
      </Pane>
    );
  }
}

ScenePane.propTypes = {
  closeCallback: PropTypes.func,
};

ScenePane.defaultProps = {
  closeCallback: null,
};

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties,
  propertyOwners: state.propertyTree.propertyOwners,
  groups: state.groups,
});

const mapSubStateToProps = ({ groups, properties, propertyOwners }) => {
  const topLevelGroups = Object.keys(groups).filter(path => {
    // Get the number of slashes in the path
    const depth = (path.match(/\//g) || []).length;
    return depth <= 1;
  }).map(path =>
    path.slice(1) // Remove leading slash
  ).reduce((obj, key) => ({ // Convert back to object
      ...obj,
      [key]: true
  }), {});

  // Reorder properties based on SceneProperties ordering property
  let sortedGroups = [];
  const ordering = properties['Modules.ImGUI.Main.SceneProperties.Ordering'];
  if (ordering && ordering.value) {
    ordering.value.forEach(item => {
      if (topLevelGroups[item]) {
        sortedGroups.push(item);
        delete topLevelGroups[item];
      }
    })
  }
  // Add the remaining items to the end.
  Object.keys(topLevelGroups).forEach(item => {
    sortedGroups.push(item);
  });

  // Add back the leading slash
  sortedGroups = sortedGroups.map(path => '/' + path);

  const matcher = (test, search) => {
    const node = propertyOwners[test.uri] || {};
    const guiHidden = isPropertyOwnerHidden(properties, test.uri);
    return ObjectWordBeginningSubstring(node, search) && !guiHidden;
  };

  const onlyEnabledMatcher = (test, search) => {
    const isEnabled = properties[`${test.uri}.Renderable.Enabled`]?.value;
    return isEnabled && matcher(test, search);
  };

  const sceneOwner = propertyOwners.Scene || {};

  return {
    groups: sortedGroups,
    propertyOwners: sceneOwner.subowners || [],
    matcher, 
    onlyEnabledMatcher
  };
};


ScenePane = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(ScenePane);

export default ScenePane;
