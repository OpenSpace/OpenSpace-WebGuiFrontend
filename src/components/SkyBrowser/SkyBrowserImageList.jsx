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
      distanceSortThreshold: 0.1
    };

    this.getNearestImages = this.getNearestImages.bind(this);
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
      const distA = euclidianDistance(a, selectedBrowserData);
      const distB = euclidianDistance(b, selectedBrowserData);
      let result = distA > distB;
      // If both the images are within a certain distance of each other
      // assume they are taken of the same object and sort on fov.
      if(euclidianDistance(a, b) < this.state.distanceSortThreshold) {
        result = a.fov > b.fov
      }
      return result ? 1 : -1;
    });

    return imgsWithinTarget;
  }

  render() {
    const imageList = this.props.showOnlyNearest ? this.getNearestImages() : this.props.imageList;
    const api = this.props.luaApi;
    const skybrowserApi = api.skybrowser;

    return (
      imageList.length > 0 && (
        <FilterList
          className={styles.filterList}
          height={this.props.height}
          data={imageList}
          searchText={`Search from ${imageList.length.toString()} images...`}
          viewComponent={SkybrowserFocusEntry}
          viewComponentProps={{
            skybrowserApi,
            currentTargetColor: this.props.getCurrentTargetColor,
          }}
          onSelect={this.props.selectImage}
          active={this.props.activeImage}
          searchAutoFocus
        />
      )
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
