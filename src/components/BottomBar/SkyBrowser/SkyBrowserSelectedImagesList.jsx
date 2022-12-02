import React from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import SkyBrowserTabEntry from './SkyBrowserTabEntry';

function SkyBrowserSelectedImagesList({
  images,
  opacities,
  luaApi,
  selectImage,
  removeImageSelection,
  setOpacityOfImage,
  currentBrowserColor,
  activeImage
}) {
  const [isDragging, setIsDragging] = React.useState(false);

  const test = React.useRef(activeImage);

  console.log(test.current === activeImage);
  test.current = activeImage;


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
    const opacitiesOrder = isLoading.current ? [...opacitiesCache.current] : [...browsers[selectedBrowserId].opacities];
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
