import React from 'react';
import { useDispatch } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import SkyBrowserTabEntry from './SkyBrowserTabEntry';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { useSubscribeToProperty } from '../../../utils/customHooks';

function SkyBrowserSelectedImagesList({
  selectImage,
  activeImage,
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const selectedPair = useSubscribeToProperty(`Modules.SkyBrowser.SelectedPairId`);
  const selectedBrowserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPair}.Browser`);
  const selectedImagesUrls = useSubscribeToProperty(`ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`) ?? [];
  const selectedImagesOpacities = useSubscribeToProperty(`ScreenSpace.${selectedBrowserId}.SelectedImagesOpacities`) ?? [];
  const borderColor = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPair}.Color`);

  const dispatch = useDispatch();

  function getCurrentOrder(layers, source, destination) {
    const [reorderedItem] = layers.splice(source, 1);
    layers.splice(destination, 0, reorderedItem);
    return layers;
  }

  function onDragStart() {
    setIsDragging(true);
  }

  async function onDragEnd(result) {
    if (!result.destination || result.source.index === result.destination.index) {
      setIsDragging(false);
      return; // no change => do nothing
    }
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const newOrderUrls = getCurrentOrder(selectedImagesUrls, sourceIndex, destIndex);
    const newOrderOpacities = getCurrentOrder(selectedImagesOpacities, sourceIndex, destIndex);

    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`).set(newOrderUrls);
    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesOpacities`).set(newOrderOpacities);

    setIsDragging(false);
  }

  function removeImageSelection(url) {
    const i = selectedImagesUrls.indexOf(url);
    const newUrls = [...selectedImagesUrls];
    newUrls.splice(i, 1);
    const newOpacities = [...selectedImagesOpacities];
    newOpacities.splice(i, 1);
    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`).set(newUrls);
    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesOpacities`).set(newOpacities);
  }

  // Invisible overlay that covers the entire body and prevents other hover effects
  // from being triggered while dragging
  const overlay = (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100
    }}
    />
  );
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      { isDragging && overlay }
      <Droppable droppableId="layers">
        { (provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            { selectedImagesUrls.map((url, index) => (
              <Draggable key={url} draggableId={url} index={index}>
                {(providedDraggable) => (
                  <div {...providedDraggable.draggableProps} ref={providedDraggable.innerRef}>
                    <SkyBrowserTabEntry
                      dragHandleTitleProps={providedDraggable.dragHandleProps}
                      key={url}
                      url={url}
                      onSelect={selectImage}
                      opacity={selectedImagesOpacities[index]}
                      isActive={activeImage === url}
                      removeSelection={removeImageSelection}
                      borderColor
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
