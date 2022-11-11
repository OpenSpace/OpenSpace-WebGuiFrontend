import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { lowPrecisionEqual } from '../../../utils/customHooks';
import PropTypes from 'prop-types';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import {FilterList, FilterListData} from '../../common/FilterList/FilterList';
import styles from './SkyBrowserNearestImagesList.scss';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';

function SkyBrowserNearestImagesList({
  activeImage,
  currentBrowserColor,
  height,
  selectImage
}) {
  const fov = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].fov
  , lowPrecisionEqual);
  const ra = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].ra
  , lowPrecisionEqual);
  const dec = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].dec
  , lowPrecisionEqual);
  const cartesianDirection = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].cartesianDirection
  , shallowEqual);
  const luaApi = useSelector((state) => state.luaApi);
  const imageList = useSelector((state) => state.skybrowser.imageList);

  const DistanceSortThreshold = 0.1;

  function euclidianDistance(vec3a, vec3b) {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += distPow2(vec3a[i], vec3b[i]);
    }
    return Math.sqrt(sum);
  }

  function distPow2(numberA, numberB) {
    return (numberA - numberB) * (numberA - numberB); 
  } 

  function isWithinFOV(coord, target, radius) {
    const lowerBoundary = target - radius;
    const higherBoundary = target + radius;
    // Test if lowerBoundary < coordinate < higherBoundary
    return lowerBoundary < coord && coord < higherBoundary ;
  }

  function getNearestImages() {
    if (!cartesianDirection || !imageList) {
      return [];
    }

    const searchRadius = fov / 2;

    // Only load images that have coordinates within current window
    const imgsWithinTarget = imageList.filter((img) => {
      if (!img.hasCelestialCoords) {
        return false; // skip
      }
      return isWithinFOV(img.ra, ra, searchRadius) &&
             isWithinFOV(img.dec, dec, searchRadius);
    });

    imgsWithinTarget.sort((a, b) => {
      const distA = euclidianDistance(a, cartesianDirection);
      const distB = euclidianDistance(b, cartesianDirection);
      let result = distA > distB;
      // If both the images are within a certain distance of each other
      // assume they are taken of the same object and sort on fov.
      if (euclidianDistance(a, cartesianDirection) < DistanceSortThreshold &&
          euclidianDistance(b, cartesianDirection) < DistanceSortThreshold)
      {
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
          {list.map(item => (
              <SkyBrowserFocusEntry 
                {...item}
                luaApi={luaApi} 
                currentBrowserColor={currentBrowserColor}
                onSelect={selectImage}
                isActive={activeImage === item.identifier}
              />
            ))}
        </FilterListData>
      </FilterList>
    );
}

SkyBrowserNearestImagesList.propTypes = {
  activeImage: PropTypes.string.isRequired,
  currentBrowserColor: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  selectImage: PropTypes.func.isRequired
};

export default SkyBrowserNearestImagesList;