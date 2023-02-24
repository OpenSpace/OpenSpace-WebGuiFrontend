import React from 'react';
import { useSelector } from 'react-redux';
import { FilterList, FilterListData } from '../../common/FilterList/FilterList';
import SkyBrowserNearestImagesList from './SkyBrowserNearestImagesList';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import Dropdown from '../../common/DropDown/Dropdown';

const ImageViewingOptions = {
  withinView: "Images within view",
  all: "All images",
  skySurveys: "Sky surveys"
};

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

  function getImageList() {      
    switch (imageViewingMode) {
      case ImageViewingOptions.withinView: {
        return (
          <SkyBrowserNearestImagesList
            activeImage={activeImage}
            currentBrowserColor={currentBrowserColor}
            selectImage={selectImage}
            height={height}
            moveCircleToHoverImage={moveCircleToHoverImage}
          />
        );
        break;
      }
      case ImageViewingOptions.all: {
        const allButSkySurveys = imageList.filter((img) => img.hasCelestialCoords);
        return (
          <FilterList
            height={height}
            searchText={`Search from ${allButSkySurveys.length.toString()} images...`}
          >
            <FilterListData>
              {allButSkySurveys.map(item => {
                return <SkyBrowserFocusEntry 
                    {...item}
                    luaApi={luaApi} 
                    currentBrowserColor={currentBrowserColor}
                    onSelect={selectImage}
                    isActive={activeImage === item.identifier}
                    moveCircleToHoverImage={moveCircleToHoverImage}
                  />
              })}
            </FilterListData>
          </FilterList>
        );
        break;
      }
      case ImageViewingOptions.skySurveys: {
        const skySurveyImages = imageList.filter((img) => !img.hasCelestialCoords);
        return (
          <FilterList
            height={height}
            searchText={`Search from ${skySurveyImages.length.toString()} images...`}
          >
            <FilterListData>
              {skySurveyImages.map(item => {
                return <SkyBrowserFocusEntry 
                    {...item}
                    luaApi={luaApi} 
                    currentBrowserColor={currentBrowserColor}
                    onSelect={selectImage}
                    isActive={activeImage === item.identifier}
                    moveCircleToHoverImage={moveCircleToHoverImage}
                  />
              })}
            </FilterListData>
          </FilterList>
        );
        break;
      }
      default: {
        return null;
        break;
      }
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