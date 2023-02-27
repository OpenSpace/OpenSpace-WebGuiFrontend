import React from 'react';
import { useSelector } from 'react-redux';
import { FilterList, FilterListData, FilterListVirtualScroll } from '../../common/FilterList/FilterList';
import SkyBrowserNearestImagesList from './SkyBrowserNearestImagesList';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import Dropdown from '../../common/DropDown/Dropdown';
import { AutoSizer, Grid } from 'react-virtualized';

const ImageViewingOptions = {
  withinView: "Images within view",
  all: "All images",
  skySurveys: "Sky surveys"
};

const getVirtualRowStyles = ({ size, startY, index, startX }) => {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '96px',
    height: size,
    transform: `translateY(${startY}px) translateX(${startX}px)`,
  }
}

export default function SkyBrowserImageList({
  activeImage,
  currentBrowserColor,
  height,
  moveCircleToHoverImage,
  selectImage
}) {
  const [imageViewingMode, setImageViewingMode] = React.useState(ImageViewingOptions.withinView);
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const luaApi = useSelector((state) => state.luaApi);
  const skySurveys = imageList.filter((img) => !img.hasCelestialCoords);
  const allImages = imageList.filter((img) => img.hasCelestialCoords);

  const entryHeight = 110;
  const entryWidth = 110;

  function getImageList() {      
    if (imageViewingMode == ImageViewingOptions.withinView) {
        return (
          <SkyBrowserNearestImagesList
            activeImage={activeImage}
            currentBrowserColor={currentBrowserColor}
            selectImage={selectImage}
            height={height}
            moveCircleToHoverImage={moveCircleToHoverImage}
          />
        );
    }
    else {
      
      return (
          <AutoSizer>
          {({ width }) => {
            const noOfCols = Math.floor(width / entryWidth); 
            const filteredImageList = imageViewingMode === ImageViewingOptions.all ? allImages : skySurveys;
            return (
              <Grid
                cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                  const index = columnIndex + (rowIndex * noOfCols);
                  if (index >= filteredImageList.length) {
                    return;
                  }
                  const item = filteredImageList[index];
                  return (
                    <SkyBrowserFocusEntry
                      key={key}
                      {...item}
                      luaApi={luaApi}
                      currentBrowserColor={currentBrowserColor}
                      onSelect={selectImage}
                      isActive={activeImage === item.identifier}
                      moveCircleToHoverImage={moveCircleToHoverImage}
                      style={style}
                    />
                  );
                }}
                columnCount={noOfCols}
                columnWidth={entryWidth}
                height={height}
                rowCount={Math.ceil(filteredImageList.length / noOfCols)}
                rowHeight={entryHeight}
                width={width}
              />
          )}}
          </AutoSizer>
        );

    }
  }

  return (
    <>
      <Dropdown
        options={Object.values(ImageViewingOptions)} 
        onChange={(anchor) => setImageViewingMode(anchor.value)} 
        value={imageViewingMode} 
        placeholder="Select a viewing mode"
        style={{ marginRight: '2px'}}
      />
      {getImageList()}
    </>
  );
}