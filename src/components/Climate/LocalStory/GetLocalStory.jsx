import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from '../../Climate/Button.scss';
import StoryButton from '../../Climate/StoryButton';

class Pick extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);
  }

  handleStory(e) {
    this.props.changeStory(e.target.id);
  }

  render() {

    const { climateStorys, displayStory } = this.props;


    //console.table(climateStorys)
    return (

            <StoryButton
              pickStory={this.handleStory}
              storyIdentifier= {climateStorys.title}
              storyId = {climateStorys.id}
            />
          
    );
  }
}

Pick.propTypes = {
  changeStory: PropTypes.func.isRequired,
  climateStorys: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,
};

export default Pick;
