import React from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import SkyBrowserTabEntry from './SkyBrowserTabEntry';

function SkyBrowserSelectedImagesList({
  luaApi,
  selectImage,
  currentBrowserColor,
  activeImage,
  passMessageToWwt,
  removeImageSelection,
  setOpacityOfImage,
  moveCircleToHoverImage
}) {
  const [isDragging, setIsDragging] = React.useState(false);
    // Each message to WorldWide Telescope has a unique order number
  const [messageCounter, setMessageCounter] = React.useState(0);

  // Cache for when Redux store is updating from OpenSpace
  // Using refs so the component doesn't update unnecessarily when they are set
  const imagesCache = React.useRef([]);
  const opacitiesCache = React.useRef([]);
  const isLoading = React.useRef(false);

  const selectedBrowserId = useSelector((state) => state.skybrowser.selectedBrowserId);
  const imageIndices = useSelector((state) => {
    const browser = state.skybrowser.browsers[selectedBrowserId];
    if (!browser || !browser?.selectedImages) {
      return [];
    }
    return Object.values(browser.selectedImages);
  }, shallowEqual);
  const imageIndicesLength = useSelector((state) => state.skybrowser.browsers[selectedBrowserId].selectedImages.length);
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const imageOpacities = useSelector((state) => state.skybrowser.browsers[selectedBrowserId].opacities, shallowEqual);

  if (!imageList || imageList.length === 0) {
    return <></>;
  }
  // Set image indices and opacities to the order they should currently have
  // Check if they are currently loading or not
  const imagesIndices = isLoading.current ? imagesCache.current : imageIndices;
  const images = imagesIndices.map(index => imageList[index.toString()]);
  const opacities = isLoading.current ? opacitiesCache.current : imageOpacities;

  // Create a cache so that the right images are displayed in the right order,
  // even in the small gap between a reorder and the updated info from OpenSpace
  React.useEffect(() => {
    imagesCache.current = [...imageIndices];
    opacitiesCache.current = [...imageOpacities];
  }, [selectedBrowserId, imageIndicesLength]);
  // Stop using the cache when the Redux store is up to date
  if (imageIndices.toString() === imagesCache.current.toString()) {
    isLoading.current = false;
  }

  function setImageLayerOrder(browserId, identifier, order) {
    luaApi.skybrowser.setImageLayerOrder(browserId, imageList[identifier].url, order);
    const reverseOrder = imageIndices.length - order - 1;
    passMessageToWwt({
      event: "image_layer_order",
      id: String(identifier),
      order: Number(reverseOrder),
      version: messageCounter
    });
    setMessageCounter(messageCounter + 1);
  }

  function getCurrentOrder(layers, source, destination) {
    const [reorderedItem] = layers.splice(source, 1);
    layers.splice(destination, 0, reorderedItem);
    return layers;
  }

  function onDragStart () {
    setIsDragging(true);
  };

  async function onDragEnd(result) {
    if (!result.destination || result.source.index === result.destination.index) {
      setIsDragging(false);
      return; // no change => do nothing
    }

    // First update the order manually, so we keep it while the properties
    // are being refreshed below
    // Images cache
    const imagesOrder = isLoading.current ? [...imagesCache.current] : [...imageIndices];
    imagesCache.current = getCurrentOrder(imagesOrder, result.source.index, result.destination.index);
    // Opacities cache
    const opacitiesOrder = isLoading.current ? [...opacitiesCache.current] : [...imageOpacities];
    opacitiesCache.current = getCurrentOrder(opacitiesOrder, result.source.index, result.destination.index);

    isLoading.current = true;
    setIsDragging(false);

    // Move image logic
    await setImageLayerOrder(selectedBrowserId, Number(result.draggableId), result.destination.index)
  };

  // Invisible overlay that covers the entire body and prevents other hover effects
  // from being triggered while dragging
  const overlay = (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100,
    }}
    />
  );
    return (
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        { isDragging && overlay }
        <Droppable droppableId="layers">
          { provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              { images.map((entry, index) => (
                <Draggable key={entry.identifier} draggableId={entry.identifier} index={index}>
                  {provided => (
                    <div {...provided.draggableProps} ref={provided.innerRef}>
                      <SkyBrowserTabEntry
                        dragHandleTitleProps={provided.dragHandleProps}
                        {...entry}
                        luaApi={luaApi}
                        key={entry.identifier}
                        onSelect={selectImage}
                        removeImageSelection={removeImageSelection}
                        opacity={opacities[index]}
                        setOpacity={setOpacityOfImage}
                        currentBrowserColor={currentBrowserColor}
                        isActive={activeImage === entry.identifier}
                        moveCircleToHoverImage={moveCircleToHoverImage}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              { provided.placeholder }
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
}

export default React.memo(SkyBrowserSelectedImagesList);
