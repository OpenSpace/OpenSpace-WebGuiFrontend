import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Input from '../common/Input/Input/Input';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';

import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';

import { setPopoverVisibility, reloadPropertyTree } from '../../api/Actions';
import { connect } from 'react-redux';

import styles from './ScreenSpaceRenderablePanel.scss';

import PropertyOwner from '../Sidebar/Properties/PropertyOwner'

class ScreenSpaceRenderablePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slideName: undefined,
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.addSlide = this.addSlide.bind(this);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  updateSlideName(evt) {
    this.setState({
      slideName: evt.target.value
    });
  }  

  updateSlideURL(evt) {
    this.setState({
      slideURL: evt.target.value
    });
  }

  updateSlideURLForFile(evt) {
    const url = evt.target.files[0].name;
    this.setState({
      slideURL: url
    });
  }

  addSlide() {
    const renderable = {        
      Identifier: this.state.slideName,
      Name: this.state.slideName 
    };
    
    if (this.state.slideURL.indexOf("http") != 0) {
      renderable.Type = 'ScreenSpaceImageLocal';
      renderable.TexturePath = this.state.slideURL;
    } else {
      renderable.Type = 'ScreenSpaceImageOnline';
      renderable.URL = this.state.slideURL;
    }

    this.props.luaApi.addScreenSpaceRenderable(renderable);

    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      this.props.refresh();
    }, 500);
  }

  get popover() {
    const slideNameLabel = <span>Slide name</span>;
    const slideURLLabel = <span>URL</span>;
    const noSlidesLabel = <CenteredLabel>No active slides</CenteredLabel>;
    const renderables = this.props.screenSpaceRenderables; 

    let slideContent;
    if (renderables.length == 0) {
      slideContent = noSlidesLabel;
    } else {
      slideContent = renderables.map(prop =>
        <PropertyOwner autoExpand={false}
                       key={prop}
                       uri={prop}
                       expansionIdentifier={"P:" + prop} />
      )
    }

    return (
      <Popover
        className={Picker.Popover}
        title="ScreenSpace Renderables"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >        
        <div className={Popover.styles.content}>
          <Row>
            <Input value={this.state.slideName}
                   label={slideNameLabel}
                   placeholder={"Slide name..."}
                   onChange={evt => this.updateSlideName(evt)} />
            <div className="urlbox">
            <Input value={this.state.slideURL}
                   label={slideURLLabel}
                   placeholder={"URL"}
                   onChange={evt => this.updateSlideURL(evt)} />
            </div>
            <div className={Popover.styles.row}>
              <Button onClick={this.addSlide}
                      title="Add slide"
                      style={{width: 90}}
                      disabled={!this.state.slideName || !this.state.slideURL}>
                <MaterialIcon icon="insert_photo" />
                <span style={{marginLeft: 5}}>Add Slide</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Slides </div>
        <div className={styles.slideList}>
          <ScrollOverlay>
            {slideContent}
          </ScrollOverlay>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible } = this.props;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
            <MaterialIcon className={styles.photoIcon} icon="insert_photo" />
          </div>
        </Picker>
        { popoverVisible && this.popover }
      </div>
    );
  }
}

const mapStateToProps = state => {
  var renderables = state.propertyTree.propertyOwners.ScreenSpace ?
    state.propertyTree.propertyOwners.ScreenSpace.subowners :
    [];

  const visible = state.local.popovers.screenSpaceRenderables.visible;
  return {
    popoverVisible: visible,
    screenSpaceRenderables: renderables,
    luaApi: state.luaApi
  }
};

const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: visible => {
    dispatch(setPopoverVisibility({
      popover: 'screenSpaceRenderables',
      visible
    }));
    if (visible) {
      dispatch(reloadPropertyTree());
    }
  },
  refresh: () => {
    dispatch(reloadPropertyTree());
  }
})

ScreenSpaceRenderablePanel =
  connect(mapStateToProps, mapDispatchToProps)(ScreenSpaceRenderablePanel);

export default ScreenSpaceRenderablePanel;