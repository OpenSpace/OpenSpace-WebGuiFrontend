import React from 'react';
import { useSelector } from 'react-redux';

import InfoButton from '../presentational/InfoButton';

function InfoButtonController() {
  const story = useSelector((state) => state.storyTree.story);

  return (
    <div>
      {story.title && (
        <InfoButton
          storyTitle={story.title}
          storyInfo={story.storyinfo}
        />
      )}
    </div>
  );
}

export default InfoButtonController;
