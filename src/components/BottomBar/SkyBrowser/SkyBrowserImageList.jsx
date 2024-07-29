/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useSelector } from 'react-redux';
import { AutoSizer, Grid } from 'react-virtualized';
import PropTypes from 'prop-types';

import { ObjectWordBeginningSubstring } from '../../../utils/StringMatchers';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import Dropdown from '../../common/DropDown/Dropdown';
import Input from '../../common/Input/Input/Input';

import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import SkyBrowserNearestImagesList from './SkyBrowserNearestImagesList';

const ImageViewingOptions = {
  withinView: 'Images within view',
  all: 'All images',
  skySurveys: 'Sky surveys'
};

function SkyBrowserImageList({
  activeImage,
  height,
  moveCircleToHoverImage,
  selectImage
}) {
  const [imageViewingMode, setImageViewingMode] = React.useState(ImageViewingOptions.withinView);
  const [searchString, setSearchString] = React.useState('');
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const skySurveys = imageList.filter((img) => !img.hasCelestialCoords);
  const allImages = imageList.filter((img) => img.hasCelestialCoords);
  const entryHeight = 110;
  const entryWidth = 110;
  const inputHeight = 41;

  React.useEffect(() => {
    setSearchString('');
  }, [imageViewingMode]);

  function getImageList() {
    if (imageViewingMode === ImageViewingOptions.withinView) {
      return (
        <SkyBrowserNearestImagesList
          activeImage={activeImage}
          selectImage={selectImage}
          height={height}
          moveCircleToHoverImage={moveCircleToHoverImage}
        />
      );
    }

    const chosenImageList = imageViewingMode === ImageViewingOptions.all ? allImages : skySurveys;
    const filteredImageList = chosenImageList.filter(
      (img) => ObjectWordBeginningSubstring(Object.values(img), searchString.toLowerCase())
    );

    return (
      <>
        <Input
          value={searchString}
          placeholder={`Search from ${chosenImageList.length.toString()} images...`}
          onChange={(e) => setSearchString(e.target.value)}
          clearable
          autoFocus
        />
        { filteredImageList.length > 0 ? (
          <AutoSizer>
            {({ width }) => {
              const noOfCols = Math.floor(width / entryWidth);
              const rows = Math.ceil(filteredImageList.length / noOfCols);
              const minRows = Math.max(rows, Math.floor((height - inputHeight) / entryHeight));

              return (
                <Grid
                  cellRenderer={({
                    columnIndex, key, rowIndex, style
                  }) => {
                    const index = columnIndex + (rowIndex * noOfCols);
                    if (index >= filteredImageList.length) {
                      return null;
                    }
                    const item = filteredImageList[index];
                    return (
                      <SkyBrowserFocusEntry
                        key={key}
                        {...item}
                        onSelect={selectImage}
                        isActive={activeImage === item.identifier}
                        moveCircleToHoverImage={moveCircleToHoverImage}
                        style={style}
                      />
                    );
                  }}
                  columnCount={noOfCols}
                  columnWidth={entryWidth}
                  height={height - inputHeight}
                  rowCount={minRows}
                  rowHeight={entryHeight}
                  width={width}
                />
              );
            }}
          </AutoSizer>
        ) :
          <CenteredLabel>Nothing found. Try another search!</CenteredLabel>}
      </>
    );
  }

  return (
    <>
      <Dropdown
        options={Object.values(ImageViewingOptions)}
        onChange={(option) => setImageViewingMode(option.value)}
        value={imageViewingMode}
        placeholder="Select a viewing mode"
        style={{ marginRight: '2px' }}
      />
      {getImageList()}
    </>
  );
}

SkyBrowserImageList.propTypes = {
  activeImage: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  selectImage: PropTypes.func.isRequired,
  moveCircleToHoverImage: PropTypes.func.isRequired
};

SkyBrowserImageList.defaultProps = {};

export default SkyBrowserImageList;
