import React from 'react';
import { useSelector } from 'react-redux';

import ToggleBoolButton from './ToggleBoolButton';

function ToggleBoolButtons() {
  const properties = useSelector((state) => state.storyTree.story.toggleboolproperties);

  // @TODO fix groups
  // @ TODO: this probably broke with rewrite. Find out where it's used and bring it back
  function handleGroup(clickedProperty) {
    properties.forEach((p) => {
      if (clickedProperty.URI !== p.URI && clickedProperty.group === p.group) {
        // this.toggleButtons[p.URI].disableIfChecked();
      }
    });
  }

  return (
    <div style={{ display: 'flex' }}>
      {properties.map((property) => (
        <ToggleBoolButton
          // @TODO fix groups
          // ref={(ref) => { this.toggleButtons[property.URI] = ref; }}
          key={property.URI}
          property={property}
          handleGroup={handleGroup}
        />
      ))}
    </div>
  );
}

export default ToggleBoolButtons;
