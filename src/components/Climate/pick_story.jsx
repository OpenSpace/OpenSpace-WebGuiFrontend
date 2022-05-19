import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import styles from './Button.scss';
import StoryButton from './StoryButton';

class Pick extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);
  }

  handleStory(e) {
    this.props.onChangeStory(e.target.id);
  }

  render() {
    const { storyInfo } = this.props;

    //console.log('item' + storyInfo.id)
    var styles = 'item' + storyInfo.id
    return (

          <div style={{height: 40+1*storyInfo.id}} >

            <StoryButton
              pickStory={this.handleStory}
              storyIdentifier={storyInfo.identifier}
              storyId = {storyInfo.id}
            />

          </div>
    );
  }
}

Pick.propTypes = {

  onChangeStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,
};

export default Pick;
