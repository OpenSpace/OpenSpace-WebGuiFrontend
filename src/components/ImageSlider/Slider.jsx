import React from 'react';
import PropTypes from 'prop-types';

import { storyImages } from '../../api/resources';
import stories from '../../stories/stories.json';

import LeftArrow from './Arrows/LeftArrow';
import RightArrow from './Arrows/RightArrow';
import Dots from './Dots/Dots';
import Slide from './Slide';

import styles from './Slider.scss';

function Slider({ changeStory, startSlide }) {
  const sliderStories = stories.stories;

  // Push images from stories object into images array
  const imagePaths = [];
  for (let i = 0; i < Object.keys(storyImages).length; i++) {
    imagePaths.push(storyImages[Object.keys(storyImages)[i]]);
  }

  let startIndex = sliderStories.findIndex(
    (element) => startSlide === element.identifier
  );
  // if startSlider was not in the listed stories, pick the first
  if (startIndex < 0) {
    startIndex = 0;
  }

  const [index, setIndex] = React.useState(startIndex);

  // Handle the click of a dot
  function handleDotClick(i) {
    if (i === index) { return; }
    setIndex(i);
  }

  function onChangeStory(newStory) {
    changeStory(newStory);
  }

  // Set the state to the next slide
  function nextSlide() {
    const nImages = imagePaths.length;
    if (index !== nImages - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  }

  // Set the state to the previous slide
  function prevSlide() {
    const nImages = imagePaths.length;
    if (index !== 0) {
      setIndex(index - 1);
    } else {
      setIndex(nImages - 1);
    }
  }

  const story = Object.values(sliderStories)[index];
  if (!story) {
    return null;
  }
  const image = storyImages[story.identifier];

  return (
    <div className={styles.Slider}>
      <div className={styles.SliderWrapper}>
        <Slide
          key={image}
          image={image}
          storyInfo={story}
          onChangeStory={onChangeStory}
        />
      </div>
      <Dots
        index={index}
        imagePaths={imagePaths}
        dotClick={handleDotClick}
      />
      <RightArrow nextSlide={nextSlide} />
      <LeftArrow prevSlide={prevSlide} />
    </div>
  );
}

Slider.propTypes = {
  changeStory: PropTypes.func.isRequired,
  startSlide: PropTypes.string
};

Slider.defaultProps = {
  startSlide: ''
};

export default Slider;
