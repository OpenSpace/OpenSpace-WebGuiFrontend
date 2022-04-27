import React, { Component } from 'react';
import { connect } from 'react-redux';
import Picker from '../Picker';
import FloatingWindow from './WindowThreeStates/FloatingWindow'
import styles from './WorldWideTelescope.scss'
import { SkyBrowser_ShowTitleInBrowserKey } from '../../../api/keys';
import { getBoolPropertyValue } from '../../../utils/propertyTreeHelpers';

class WorldWideTelescope extends Component {
  constructor(props) {
    super(props);
    this.iframe = React.createRef();
    this.state = {
      isDragging: false,
      startDragPosition: [0,0],
      topBarHeight: 25,
    };
    this.sendMessageToWwt = this.sendMessageToWwt.bind(this);
    this.setAim = this.setAim.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleCallbackMessage = this.handleCallbackMessage.bind(this);
    this.addAllSelectedImages = this.addAllSelectedImages.bind(this);
    this.scroll = this.scroll.bind(this);
    this.changeSize = this.changeSize.bind(this);
    this.setBorderColor = this.setBorderColor.bind(this);
    this.color = [255, 255, 255];
    this.ratio = 1;
  }

  componentDidMount() {
    this.props.setMessageFunction(this.sendMessageToWwt);
    window.addEventListener("message", this.handleCallbackMessage);
    this.props.setImageCollectionIsLoaded(false);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleCallbackMessage);
  }

  handleCallbackMessage(event) {
    if (event.data == "wwt_has_loaded") {
      this.sendMessageToWwt({
        event : "modify_settings",
        settings : [["hideAllChrome", true]],
        target: "app"
      });
      this.sendMessageToWwt({
        event: "load_image_collection",
        url:"https://data.openspaceproject.com/wwt/1/imagecollection.wtml",
        loadChildFolders: true
      });
      if (this.props.browser) {
        this.setBorderColor(this.props.browser.color);
      }
    }
    if (event.data == "load_image_collection_completed") {
      this.props.setImageCollectionIsLoaded(true);
      this.addAllSelectedImages();
    }
  }

  setBorderColor(color) {
    this.color = color;
    this.sendMessageToWwt({
      event: "set_background_color",
      data: color}
    );
  }

  addAllSelectedImages() {
    this.props.selectedImages.reverse().map(image => {
      this.props.selectImage(image.identifier, false);
    });
  }

  sendMessageToWwt(message) {
    try {
      var frame = this.iframe.current.contentWindow;
      if (frame) {
        frame.postMessage(message, "*");
      }
    } catch (error) {
    }
  }

  setAim(ra, dec, fov, roll) {
    this.sendMessageToWwt({
      "event" : "center_on_coordinates",
      "ra" : ra,
      "dec" : dec,
      "fov" : fov,
      "roll" : roll,
      "instant" : true
    });
  }

  handleDrag(mouse) {
    if (this.state.isDragging) {
      const end = [mouse.clientX, mouse.clientY];
      this.props.skybrowserApi.finetuneTargetPosition(
        this.props.browser.id,
        this.state.startDragPosition, 
        end
      );
    }
  }

  mouseDown(mouse) {
    this.props.skybrowserApi.startFinetuningTarget(this.props.browser.id);
    const position = [mouse.clientX, mouse.clientY];
    this.setState({
      isDragging : true,
      startDragPosition: position
    });
  }

  mouseUp(mouse) {
    this.setState({isDragging : false});
  }

  scroll(e) {
    this.props.skybrowserApi.scrollOverBrowser(this.props.browser.id, e.deltaY);
  }

  changeSize(widthWwt, heightWwt) {
    const { topBarHeight } = this.state;
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const ratio = widthWwt / (heightWwt - topBarHeight);
    const scale = (heightWwt - topBarHeight) / windowHeight;
    const newWidth = 2 * scale * ratio;
    const newHeight = 2 * scale;
    const id = this.props.browser.id;
    this.props.setSize({ width: widthWwt, height: heightWwt });
    this.props.skybrowserApi.setScreenSpaceSize(id, newWidth, newHeight);
  }

  render() {
    const {browser, showTitle, size} = this.props;
    if (!browser) {
      return "";
    }

    if (browser.color != this.color) {
      this.setBorderColor(browser.color);
      this.color = browser.color;
    }

    this.setAim(browser.ra, browser.dec, browser.fov, browser.roll);

    const topBar = 
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{showTitle && this.props.browser.name}</div>
      </header>;

    // Covering div to handle interaction
    const interactionDiv = <div
      className={styles.container}
      onMouseMove={this.handleDrag}
      onMouseDown={this.mouseDown}
      onMouseUp={this.mouseUp}
      onMouseLeave={this.mouseUp}
      onWheel = {(e) => this.scroll(e)}
    />

    return (
      <FloatingWindow
        className={`${Picker.Popover}`}
        title={browser.name}
        closeCallback={this.togglePopover}
        defaultSize={{ height: `425px`, width: `400px` }}
        size={{ height: `${size.height}px`, width: `${size.width}px` }}
        position={{ x: -800, y: -600 }}
        setNewHeight={this.changeSize}
      >
        {topBar}
        <div className={styles.content}>
          {interactionDiv}
          <iframe
            id="webpage"
            name = "wwt"
            ref={this.iframe}
            src="http://wwt.openspaceproject.com/1/gui/"
            allow="accelerometer; clipboard-write; gyroscope"
            allowFullScreen
            frameBorder="0"
            align="middle"
            className={styles.wwt}
          >
            <p>ERROR: cannot display AAS WorldWide Telescope research app!</p>
          </iframe>
        </div>
      </FloatingWindow>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    showTitle: getBoolPropertyValue(state, SkyBrowser_ShowTitleInBrowserKey)
  }
};

const mapDispatchToProps = dispatch => ({
  startListeningToProperties: () => {
    dispatch(subscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
  },
  stopListeningToProperties: () => {
    dispatch(unsubscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
  },
})

WorldWideTelescope = connect(
  mapStateToProps,
  mapDispatchToProps)
(WorldWideTelescope);

export default WorldWideTelescope;
