import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { storyImages } from '../../api/resources';
import stories from '../../stories/stories.json';

import LeftArrow from './Arrows/LeftArrow';
import RightArrow from './Arrows/RightArrow';
import Dots from './Dots/Dots';
import Slide from './Slide';

import styles from './Slider.scss';

class Slider extends Component {
  constructor(props) {
    super(props);

    const { startSlider } = this.props;

    let startIndex = stories.stories.findIndex(
      (element) => startSlider === element.identifier
    );

    // if startSlider was not in the listed stories, pick the first
    if (startIndex < 0) {
      startIndex = 0;
    }

    this.state = {
      index: startIndex,
      imagePaths: [],
      stories: stories.stories
    };

    // Push images from stories object into images array
    for (let i = 0; i < Object.keys(storyImages).length; i++) {
      this.state.imagePaths.push(storyImages[Object.keys(storyImages)[i]]);
    }

    // Bind the functions in the constructor
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.handleDotClick = this.handleDotClick.bind(this);
    this.onChangeStory = this.onChangeStory.bind(this);
  }

  // Handle the click of a dot
  handleDotClick(i) {
    if (i === this.state.index) { return; }
    this.setState({ index: i });
  }

  onChangeStory(story) {
    this.props.changeStory(story);
  }

  // Set the state to the next slide
  nextSlide() {
    const prevIndex = this.state.index;
    const nImages = this.state.imagePaths.length;
    if (prevIndex !== nImages - 1) {
      this.setState({ index: prevIndex + 1 });
    } else {
      this.setState({ index: 0 });
    }
  }

  // Set the state to the previous slide
  prevSlide() {
    const prevIndex = this.state.index;
    const nImages = this.state.imagePaths.length;
    if (prevIndex !== 0) {
      this.setState({ index: prevIndex- 1 });
    } else {
      this.setState({ index: nImages - 1 });
    }
  }

  render() {
    const story = Object.values(this.state.stories)[this.state.index];
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
            onChangeStory={this.onChangeStory}
          />
        </div>
        <Dots
          index={this.state.index}
          imagePaths={this.state.imagePaths}
          dotClick={this.handleDotClick}
        />
        <RightArrow nextSlide={this.nextSlide} />
        <LeftArrow prevSlide={this.prevSlide} />
      </div>
    );
  }
}

Slider.propTypes = {
  changeStory: PropTypes.func.isRequired
};

export default Slider;
