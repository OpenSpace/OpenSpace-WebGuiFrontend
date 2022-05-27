import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import InfoMenu from './infoMenu'
import { connect } from 'react-redux';
import NextStepButton from './nextButton';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer,
} from '../../utils/storyHelpers';
class ExploreClimate extends Component{

  constructor(props) {
    super(props);

    this.state = {
      StoryStep: 0,
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);
    this.Decrement = this.Decrement.bind(this);
  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1
    }));
  }
  Decrement = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1
    }));
  }

  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    var idnr = json.journey.length;

    return(
      filePath.map((story) => {
        if(story.id == StoryStep){
          console.log("storystep " + StoryStep);
          console.log("hej",idnr);
          storyGetLayer(luaApi, story.toggleboolproperties);
          console.log("asset " + story.toggleboolproperties);
          //console.log("id "= story.id);
          return (
            <div key = {story.id}>
              <h1>
                {story.title}
              </h1>
              <p>
                {story.storyinfo}
              </p>
            </div>
          );
        }
      })
    );

  }


  render() {
    const { json, story, storyInfo} = this.props;
    const { StoryStep } = this.state;

    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);

    //var stepThroughLocal = this.stepThroughStory(StoryStep, json.local)

    console.log("woooopie" + StoryStep)
    console.table("j " + stepThroughJourney)
    //console.table("l " + stepThroughLocal)

    if(StoryStep < stepThroughJourney.length){
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">
              {stepThroughJourney}
              <br/>
              <br/>
              <br/>
              <br/>
              <br/>
              { StoryStep <  stepThroughJourney.length-1 &&
                <section className = {styles.NextStepButton}>
                  <NextStepButton next = {this.Increment} storyStep = {StoryStep} string = {"Next!"}/>
                </section>
              }
              {StoryStep > 0 &&
                <section className = {styles.PrevStepButton}>
                  <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previous!"}/>}
                </section>
              }

          </div>
        </div>
        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>
        </section>
      </div>

      );
    }

    else{
      return(
        <div className={styles.StoryPosistion}>
          <div className = {styles.TellStory}>
        //{stepThroughLocal}
            {StoryStep > 0 &&
              <section className = {styles.PrevStepButton}>
                <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previous!!!"}/>}
              </section>
            }
        </div>
      </div>

      );
  }
  }
}



ExploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
  luaApi: PropTypes.object,
};
ExploreClimate.defaultProps = {
  story: {},
  json: {},
};
const mapSubStateToProps = ({ luaApi }) => {
  return {
    luaApi: luaApi,
  };
};

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
});
ExploreClimate = connect(subStateToProps(mapSubStateToProps, mapStateToSubState))(ExploreClimate);

export default ExploreClimate;
