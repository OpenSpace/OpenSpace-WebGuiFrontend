import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import PropTypes from 'prop-types';

import InfographicSkyBrowser from '../../../icons/infographicSkyBrowser.svg';
import { lowPrecisionEqual } from '../../../utils/customHooks';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import { FilterList, FilterListData } from '../../common/FilterList/FilterList';

import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';

import styles from './SkyBrowserNearestImagesList.scss';

function SkyBrowserNearestImagesList({
  activeImage,
  currentBrowserColor,
  height,
  moveCircleToHoverImage,
  selectImage
}) {
  const fov = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].fov,
    lowPrecisionEqual
  );
  const ra = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].ra,
    lowPrecisionEqual
  );
  const dec = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].dec,
    lowPrecisionEqual
  );
  const cartesianDirection = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].cartesianDirection,
    shallowEqual
  );
  const imageList = useSelector((state) => state.skybrowser.imageList);

  const DistanceSortThreshold = 0.1;

  function distPow2(numberA, numberB) {
    return (numberA - numberB) * (numberA - numberB);
  }

  function euclidianDistance(vec3a, vec3b) {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += distPow2(vec3a[i], vec3b[i]);
    }
    return Math.sqrt(sum);
  }

  function isWithinFOV(coord, target, radius) {
    const lowerBoundary = target - radius;
    const higherBoundary = target + radius;
    // Test if lowerBoundary < coordinate < higherBoundary
    return lowerBoundary < coord && coord < higherBoundary;
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
          euclidianDistance(b, cartesianDirection) < DistanceSortThreshold) {
        result = a.fov > b.fov;
      }
      return result ? 1 : -1;
    });

    return imgsWithinTarget;
  }

  const list = getNearestImages();

  const showNoImagesHint = list.length === 0;

  return (showNoImagesHint ? (
    <CenteredLabel>
      No images within the current view.
      Zoom out or move the target to look at another portion of the sky
      <ReactSVG src={InfographicSkyBrowser} />
    </CenteredLabel>
  ) : (
    <FilterList
      className={styles.filterList}
      height={height} // TODO: prevent rerendering every time height changes
      searchText={`Search from ${list.length.toString()} images...`}
    >
      <FilterListData>
        {list.map((item) => (
          <SkyBrowserFocusEntry
            {...item}
            currentBrowserColor={currentBrowserColor}
            onSelect={selectImage}
            isActive={activeImage === item.identifier}
            moveCircleToHoverImage={moveCircleToHoverImage}
          />
        ))}
      </FilterListData>
    </FilterList>
  )
  );
}

SkyBrowserNearestImagesList.propTypes = {
  activeImage: PropTypes.string.isRequired,
  currentBrowserColor: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  moveCircleToHoverImage: PropTypes.func.isRequired,
  selectImage: PropTypes.func.isRequired
};

export default SkyBrowserNearestImagesList;
