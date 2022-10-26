import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import {FilterList, FilterListData} from '../../common/FilterList/FilterList';
import styles from './SkyBrowserNearestImagesList.scss';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';

function SkyBrowserNearestImagesList({
  activeImage,
  height,
  selectImage,
  currentBrowserColor
}) {
  const fov = useSelector((state) => {
    return state.skybrowser.browsers[state.skybrowser.selectedBrowserId].fov;
  }, shallowEqual);
  const ra = useSelector((state) => {
    return state.skybrowser.browsers[state.skybrowser.selectedBrowserId].ra;
  }, shallowEqual);
  const dec = useSelector((state) => {
    return state.skybrowser.browsers[state.skybrowser.selectedBrowserId].dec;
  }, shallowEqual);
  const cartesianDirection = useSelector((state) => {
    return state.skybrowser.browsers[state.skybrowser.selectedBrowserId].cartesianDirection;
  }, shallowEqual);
  const luaApi = useSelector((state) => {
    return state.luaApi
  }, shallowEqual);
  const imageList = useSelector((state) => {
    return state.skybrowser.imageList
  }, shallowEqual);

  const distanceSortThreshold = 0.1;

  function euclidianDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += distPow2(a[i], b[i]);
    }
    return Math.sqrt(sum);
  }

  function distPow2(a, b) {
    return (a - b) * (a - b); 
  } 

  function getNearestImages() {
    if (!cartesianDirection || !imageList) {
      return [];
    }

    const searchRadius = fov / 2;
    const isWithinFOV = (coord, target, FOV) => coord < target + FOV && coord > target - FOV;

    // Only load images that have coordinates within current window
    const imgsWithinTarget = imageList.filter((img) => {
      if (!img.hasCelestialCoords) {
        return false; // skip
      }
      return isWithinFOV(img.ra, ra, searchRadius)
        && isWithinFOV(img.dec, dec, searchRadius);
    });

    imgsWithinTarget.sort((a, b) => {
      const distA = euclidianDistance(a, cartesianDirection);
      const distB = euclidianDistance(b, cartesianDirection);
      let result = distA > distB;
      // If both the images are within a certain distance of each other
      // assume they are taken of the same object and sort on fov.
      if (euclidianDistance(a, cartesianDirection) < distanceSortThreshold &&
          euclidianDistance(b, cartesianDirection) < distanceSortThreshold ) {
        result = a.fov > b.fov
      }
      return result ? 1 : -1;
    });

    return imgsWithinTarget;
  }

  const list = getNearestImages();

  const showNoImagesHint = list.length === 0;

  return (showNoImagesHint ?
      <CenteredLabel>No images within the current view. Zoom out or move the target to look at another portion of the sky</CenteredLabel>
    :
      <FilterList
        className={styles.filterList}
        height={height} // TODO: prevent rerendering every time height changes
        searchText={`Search from ${list.length.toString()} images...`}
      >
        <FilterListData>
          {list.map(item => {
            return <SkyBrowserFocusEntry 
                {...item}
                luaApi={luaApi} 
                currentBrowserColor={currentBrowserColor}
                onSelect={selectImage}
                isActive={activeImage === item.identifier}
              />
          })}
        </FilterListData>
      </FilterList>
    );
}

SkyBrowserNearestImagesList.propTypes = {
};

SkyBrowserNearestImagesList.defaultProps = {
};

export default SkyBrowserNearestImagesList;
