import React from 'react';
import { useSelector } from 'react-redux';
import { useVirtual } from 'react-virtual'
import { FilterList, FilterListData, FilterListVirtualScroll } from '../../common/FilterList/FilterList';
import SkyBrowserNearestImagesList from './SkyBrowserNearestImagesList';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import Dropdown from '../../common/DropDown/Dropdown';

const ImageViewingOptions = {
  withinView: "Images within view",
  all: "All images",
  skySurveys: "Sky surveys"
};

const getVirtualRowStyles = ({size, start}) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: size,
  transform: `translateY(${start}px)`,
})

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
  const skySurveyImages = imageList.filter((img) => !img.hasCelestialCoords);
  const allButSkySurveys = imageList.filter((img) => img.hasCelestialCoords);

  const listRef = React.useRef()

  const skySurveyVirtualizer = useVirtual({
    size: skySurveyImages?.length ?? 0,
    parentRef: listRef,
    estimateSize: React.useCallback(() => 100, []),
    overscan: 10,
  }, [imageList]);

  const imagesVirtualizer = useVirtual({
    size: allButSkySurveys?.length ?? 0,
    parentRef: listRef,
    estimateSize: React.useCallback(() => 100, []),
    overscan: 10,
  }, [imageList]);

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
      let filteredList = [];
      let noOfImages = 0;
      let imageListCopy = [];
      if (imageViewingMode == ImageViewingOptions.all) {
        filteredList = imagesVirtualizer;
        noOfImages = allButSkySurveys.length.toString();
        imageListCopy = allButSkySurveys;
      }
      else {
        filteredList = skySurveyVirtualizer;
        noOfImages = skySurveyImages.length.toString();
        imageListCopy = skySurveyImages;
      }
      return (
          <FilterList
            height={height}
            searchText={`Search from ${noOfImages} images...`}
          >
            <FilterListData ref={listRef}>
              <FilterListVirtualScroll height={ filteredList.totalSize} />
              {filteredList.virtualItems.map(({ index, size, start }) => {
                const item = imageListCopy[index];
                if (!item) return null
                return <SkyBrowserFocusEntry 
                    {...item}
                    luaApi={luaApi} 
                    currentBrowserColor={currentBrowserColor}
                    onSelect={selectImage}
                    isActive={activeImage === item.identifier}
                    moveCircleToHoverImage={moveCircleToHoverImage}
                    style={getVirtualRowStyles({size, start})}
                  />
              })}
            </FilterListData>
          </FilterList>
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