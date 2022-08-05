import React, { Component } from 'react';
import { connect } from 'react-redux';
import shallowEqualArrays from 'shallow-equal/arrays';
import shallowEqualObjects from 'shallow-equal/objects';
import Picker from '../Picker';
import FloatingWindow from './WindowThreeStates/FloatingWindow'
import styles from './WorldWideTelescope.scss'
import { SkyBrowser_ShowTitleInBrowserKey, SkyBrowser_InverseZoomDirectionKey } from '../../../api/keys';
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

  componentDidUpdate(prevProps) {
    const { browserAimInfo, browserColor } = this.props;
    if (prevProps.browserColor !== browserColor) {
      this.setBorderColor(browserColor);
      this.color = browserColor;
    }

    if (!shallowEqualObjects(prevProps.browserAimInfo, browserAimInfo)) {
      this.setAim(browserAimInfo);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { browserAimInfo, browserColor, browserId } = this.props;

    return (
      !shallowEqualObjects(nextProps.browserAimInfo, browserAimInfo) ||
      nextProps.browserId !== browserId ||
      !shallowEqualArrays(nextProps.browserColor,browserColor)
    );
  }

  handleCallbackMessage(event) {
    const { browserId, url } = this.props;
    if (event.data == "wwt_has_loaded") {
      this.sendMessageToWwt({
        event: "modify_settings",
        settings: [["hideAllChrome", true]],
        target: "app"
      });
      this.sendMessageToWwt({
        event: "load_image_collection",
        url: url,
        loadChildFolders: true
      });
      this.setBorderColor(this.props.browserColor);
    }
    if (event.data == "load_image_collection_completed") {
      this.props.setImageCollectionIsLoaded(true);
      this.props.addAllSelectedImages(browserId, false);
    }
  }

  setBorderColor(color) {
    this.color = color;
    this.sendMessageToWwt({
      event: "set_background_color",
      data: color
    });
  }

  sendMessageToWwt(message) {
    try {
      let frame = this.iframe.current.contentWindow;
      if (frame) {
        frame.postMessage(message, "*");
      }
    } catch (error) {
      // Do nothing
    }
  }

  setAim(aimInfo) {
    this.sendMessageToWwt({
      "event": "center_on_coordinates",
      "ra": aimInfo.ra,
      "dec": aimInfo.dec,
      "fov": aimInfo.fov,
      "roll": aimInfo.roll,
      "instant": true
    });
  }

  handleDrag(mouse) {
    if (this.state.isDragging) {
      const { topBarHeight, startDragPosition } = this.state;
      const { size, browserAimInfo } = this.props;
      // Calculate pixel translation
      const end = [mouse.clientX, mouse.clientY];
      const borderWidth = 10;
      const width = size.width - borderWidth;
      const height = size.height - borderWidth;
      const translation = [end[0] - startDragPosition[0], end[1] - startDragPosition[1]];
      // Calculate [ra, dec] translation without roll
      const percentageTranslation = [translation[0] / width, translation[1] / height];
      const ratio = width / (height - topBarHeight);
      const fovs = [ratio * browserAimInfo.fov, browserAimInfo.fov];
      const raDecTranslation = [percentageTranslation[0] * fovs[0], percentageTranslation[1] * fovs[1]];
      // Apply roll
      const roll = -browserAimInfo.roll * (Math.PI / 180);  
      const ra = raDecTranslation[0] * Math.cos(roll) - raDecTranslation[1] * Math.sin(roll);
      const dec = raDecTranslation[0] * Math.sin(roll) + raDecTranslation[1] * Math.cos(roll);
      // Call lua function
      this.props.skybrowserApi.finetuneTargetPosition(
        this.props.browserId,
        [ra, dec]
      );
    }
  }

  mouseDown(mouse) {
    this.props.skybrowserApi.startFinetuningTarget(this.props.browserId);
    const position = [mouse.clientX, mouse.clientY];
    this.setState({
      isDragging: true,
      startDragPosition: position
    });
    this.props.skybrowserApi.stopAnimations(this.props.browserId);
  }

  mouseUp(mouse) {
    this.setState({isDragging: false});
  }

  scroll(e) {
    let scroll = e.deltaY;
    if (this.props.inverseZoom) {
      scroll *= -1;
    }
    this.props.skybrowserApi.scrollOverBrowser(this.props.browserId, scroll);
    this.props.skybrowserApi.stopAnimations(this.props.browserId);
  }

  changeSize(widthWwt, heightWwt) {
    const { topBarHeight } = this.state;
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const ratio = widthWwt / (heightWwt - topBarHeight);
    const scale = (heightWwt - topBarHeight) / windowHeight;
    const newWidth = 2 * scale * ratio;
    const newHeight = 2 * scale;
    const id = this.props.browserId;
    this.props.setSize({ width: widthWwt, height: heightWwt });
    this.props.skybrowserApi.setBrowserRatio(id, newWidth / newHeight);
  }

  render() {
    const { browserName, showTitle, size, position, setPosition } = this.props;

    const topBar =
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{showTitle && browserName}</div>
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
        title={browserName}
        closeCallback={this.togglePopover}
        defaultSize={{ height: `425px`, width: `400px` }}
        size={{ height: `${size.height}px`, width: `${size.width}px` }}
        position={position}
        handleStop={setPosition}
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
    showTitle: getBoolPropertyValue(state, SkyBrowser_ShowTitleInBrowserKey),
    inverseZoom: getBoolPropertyValue(state, SkyBrowser_InverseZoomDirectionKey),
  }
};

const mapDispatchToProps = dispatch => ({
  startListeningToProperties: () => {
    dispatch(subscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
    dispatch(subscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
  },
  stopListeningToProperties: () => {
    dispatch(unsubscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
    dispatch(unsubscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
  },
})

WorldWideTelescope = connect(
  mapStateToProps,
  mapDispatchToProps)
(WorldWideTelescope);

export default WorldWideTelescope;
