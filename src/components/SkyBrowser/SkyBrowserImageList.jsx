import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterList from '../common/FilterList/FilterList';
import Picker from '../BottomBar/Picker';
import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';
import styles from './SkyBrowserImageList.scss';
import SkybrowserFocusEntry from './SkybrowserFocusEntry';

class SkyBrowserImageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyNearest: true,
    };

    this.getNearestImages = this.getNearestImages.bind(this);
    this.createImageMenu = this.createImageMenu.bind(this);
  }

  getNearestImages() {
    const { imageList, selectedBrowserData } = this.props;

    if (!selectedBrowserData || Object.keys(imageList).length === 0) {
      return [];
    }
    const searchRadius = selectedBrowserData.FOV / 2;
    const isWithinFOV = (coord, target, FOV) => coord < target + FOV && coord > target - FOV;

    // Only load images that have coordinates within current window
    const imgsWithinTarget = imageList.filter((img) => {
      if (!img.hasCelestialCoords) {
        return false; // skip
      }
      if (
        isWithinFOV(img.ra, selectedBrowserData.ra, searchRadius)
        && isWithinFOV(img.dec, selectedBrowserData.dec, searchRadius)
      ) {
        return true;
      }
      return false;
    });

    const distPow2 = (a, b) => (a - b) * (a - b);

    const euclidianDistance = (a, b) => {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += distPow2(a.cartesianDirection[i], b.cartesianDirection[i]);
      }
      return Math.sqrt(sum);
    };

    imgsWithinTarget.sort((a, b) => {
      const result = euclidianDistance(a, selectedBrowserData) > euclidianDistance(b, selectedBrowserData);
      return result ? 1 : -1;
    });
    return imgsWithinTarget;
  }

  createImageMenu() {
    const { showOnlyNearest } = this.state;
    return (
      <div className={styles.row}>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.unselected : styles.selected}`}
          onClick={() => this.setState({ showOnlyNearest: false })}
        >
          <span>All images</span>
        </Picker>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.selected : styles.unselected}`}
          onClick={() => this.setState({ showOnlyNearest: true })}
        >
          <span>Images within view</span>
        </Picker>
      </div>
    );
  }

  render() {
    const imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.props.imageList;
    const api = this.props.luaApi;
    const skybrowserApi = api.skybrowser;

    const filterList = imageList.length > 0 && (
      <FilterList
        className={styles.filterList}
        data={imageList}
        searchText={`Search from ${imageList.length.toString()} images...`}
        viewComponent={SkybrowserFocusEntry}
        viewComponentProps={{ skybrowserApi, currentTargetColor: this.props.getCurrentTargetColor }}
        onSelect={this.props.selectImage}
        active={this.props.activeImage}
        searchAutoFocus
      />
    );

    return (
      <div className={styles.listContainer}>
        {this.createImageMenu()}
        {filterList}
      </div>
    );
  }
}

SkyBrowserImageList.propTypes = {
  api: PropTypes.object,
};

SkyBrowserImageList.defaultProps = {
  api: null,
};

export default SkyBrowserImageList;
