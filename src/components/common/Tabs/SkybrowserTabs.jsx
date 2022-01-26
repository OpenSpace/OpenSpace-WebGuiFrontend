import React, { Component } from 'react';
import styles from './SkybrowserTabs.scss';
import Button from '../Input/Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { excludeKeys } from '../../../utils/helpers';
import PropTypes from 'prop-types';
import ScrollOverlay from '../../common/ScrollOverlay/ScrollOverlay';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import { Resizable } from 're-resizable';
import TooltipSkybrowser from '../../common/Tooltip/TooltipSkybrowser';
import NumericInput from '../Input/NumericInput/NumericInput'
import ColorPickerPopup from '../ColorPicker/ColorPickerPopup'
import Row from '../Row/Row'

class SkybrowserTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 185,
            currentHeight: 185,
            showButtonInfo1: false,
            showButtonInfo2: false,
            showButtonInfo3: false,
            showButtonInfo4: false,
            showButtonInfo5: false,
            showSettings: false
        }
        this.createTabs = this.createTabs.bind(this);
        this.createImageList = this.createImageList.bind(this);
        this.onResizeStop = this.onResizeStop.bind(this);
        this.onResize = this.onResize.bind(this);
        this.setRef = this.setRef.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.handleDeleteTab = this.handleDeleteTab.bind(this);
        this.toggleShowSettings = this.toggleShowSettings.bind(this);
        this.createSettings = this.createSettings.bind(this);
        this.valueToColor = this.valueToColor.bind(this);
    }

    get inheritedProps() {
        const doNotInclude = 'closeCallback className position size title';
        return excludeKeys(this.props, doNotInclude);
    }

    get position() {
        if (!this.wrapper) return { top: '0px', left: '0px' };
        const { top, right} = this.wrapper.getBoundingClientRect();
        return { top: `${top}`, left: `${right}`};
    }

    setRef(what) {
        return (element) => {
          this[what] = element;
        };
    }

    showTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : !this.state.showButtonInfo1});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : !this.state.showButtonInfo2});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : !this.state.showButtonInfo3});
        else if(buttonNumber == 4) this.setState({showButtonInfo4 : !this.state.showButtonInfo4});
        else this.setState({showButtonInfo5 : !this.state.showButtonInfo5})

    }

    hideTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : false});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : false});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : false});
        else if(buttonNumber == 4) this.setState({showButtonInfo4 : false});
        else this.setState({showButtonInfo5 : false})
    }

    toggleShowSettings() {
      this.setState({
          showSettings: !this.state.showSettings
      })
      console.log(this.state.showSettings);
    }

    createTabs() {

        const { showButtonInfo1, showButtonInfo2, showButtonInfo3, showButtonInfo4, showButtonInfo5 } = this.state;
        const { targets, currentTarget, removeBrowser} = this.props;
        const { lockTarget, unlockTarget, createTargetBrowserPair, adjustCameraToTarget, select2dImagesAs3d, centerTarget, selectTab} = this.props.viewComponentProps;

        const allTabs = Object.keys(targets).map((target, index) => {

            let targetColor = 'rgb(' + targets[target].color + ')';
            let targetIsLocked = targets[target].isLocked;

            return(
                <div key={index}
                style={currentTarget === target ? {borderTopRightRadius: "4px", borderTop:  "3px solid " + targetColor}:{}}>
                    <div className={ currentTarget === target ? styles.tabActive : styles.tab } onClick={() => selectTab(target)}>
                        <span className={styles.tabHeader}>
                            <span className={styles.tabTitle}>{ targets[target].name }</span>
                            <Button onClick={() => removeBrowser(target)} className={styles.closeTabButton} transparent small>
                                <MaterialIcon icon="close" className="small"/>
                            </Button>
                        </span>
                            { currentTarget === target &&
                            <span className={styles.tabButtonContainer} ref={this.setRef('wrapper')}>
                                <Button onClick={() => adjustCameraToTarget(target)} onMouseLeave={() => this.hideTooltip(1)}
                                className={styles.tabButton} transparent small>
                                    <MaterialIcon icon="visibility" className={"small"} onMouseEnter={() => this.showTooltip(1)}/>
                                    { showButtonInfo1 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Look at target"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={() => centerTarget(target)} onMouseLeave={() => this.hideTooltip(2)}
                                className={styles.tabButton} transparent small >
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(2)} icon="filter_center_focus" className="small"/>
                                    { showButtonInfo2 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Move target to center of view"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={targetIsLocked ? () => unlockTarget(target) : () => lockTarget(target)}
                                onMouseLeave={() => this.hideTooltip(3)} className={targetIsLocked ? styles.tabButtonActive : styles.tabButton}
                                transparent small>
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(3)} icon="lock" className="small"/>
                                    { showButtonInfo3 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Lock aim of target"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={() => select2dImagesAs3d(target)} onMouseLeave={() => this.hideTooltip(4)}
                                className={styles.tabButton} transparent small>
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(4)} icon="get_app" className="small"/>
                                    { showButtonInfo4 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Add images to 3D Browser"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={() => this.toggleShowSettings()} onMouseLeave={() => this.hideTooltip(5)}
                                className={this.state.showSettings ? styles.tabButtonActive : styles.tabButton} transparent small>
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(5)} icon="settings" className="small"/>
                                    { showButtonInfo5 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Settings"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                            </span>
                            }
                    </div>
                </div>
            );
        });
        return (
            <div className={styles.navTabs}>
                {allTabs}
                <Button onClick={() => createTargetBrowserPair()} className={styles.addTabButton} transparent>
                    <MaterialIcon icon="add" />
                </Button>
            </div>
        );
    }

    createImageList(data, props) {
      const EntryComponent = props.viewComponent;
       return <ScrollOverlay>
            { data.length === 0 ? (
            <CenteredLabel>There are no loaded images in this Sky Browser.</CenteredLabel>
            ) : (
            <ul>
                { data.map((entry, index) => (
                     <div>
                    {(index == 0) ? <span className={styles.arrowButtonEmpty} transparent></span> :
                        <Button onClick={() => props.setImageOrder(entry.identifier , index - 1)} className={styles.arrowButton} transparent>
                        <MaterialIcon icon="keyboard_arrow_left" />
                        </Button>
                    }
                    <EntryComponent
                    {...entry}
                    {...props.viewComponentProps}
                    key={entry.identifier}
                    onSelect={this.props.viewComponentProps.selectImage}
                    />
                    {
                    (index == data.length -1) ? <span className={styles.arrowButtonEmpty} transparent></span> :
                        <Button onClick={() => props.setImageOrder(entry.identifier, index + 1)} className={styles.arrowButton} transparent>
                        <MaterialIcon icon="keyboard_arrow_right" />
                        </Button>
                      }
                  </div>
                ))}
            </ul>
            )}
        </ScrollOverlay>
    }

    valueToColor(color) {

      return {
          r: color[0],
          g: color[1],
          b: color[2],
          a: 1.0
      }
    }

    createSettings(target, setFov, setBorderColor, setEquatorialAim, setScreenSpaceSize) {
      // Take half to display in ranges [0,1] instead of [0,2]
      let size = target.size.map((value) => value * 0.5) ;
      let colors = target.color;
      let colorData = ['Border Color: Red', 'Green', 'Blue'];
      let sizeData = ['Browser Width', 'Browser Height'];
      let precision = 7;

      // TODO: Fix color picker
      let colorPicker = <ColorPickerPopup
        disableAlpha={true}
        color={this.valueToColor(target.color)}
        onChange={(values) => { }}
        placement="right"
        disabled={false}
      />;

      return <ScrollOverlay>
                <NumericInput className= 'Vertical Field Of View'
                label = 'Vertical Field Of View'
                max = {70}
                min = {0.0000000001}
                disabled={!setFov}
                onValueChanged={setFov}
                step = {1}
                value = {parseFloat(target.FOV.toFixed(precision))}
                placeholder={`value 0`}
                >
                </NumericInput>
                <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
                   <NumericInput className= 'Right Ascension'
                    label = 'Right Ascension'
                    max = {360}
                    min = {0}
                    disabled={!setFov}
                    onValueChanged={(value) => setEquatorialAim(value, target.dec)}
                    step = {0.1}
                    value = {parseFloat(target.ra.toFixed(precision))}
                    placeholder={`value 1`}
                    />
                    <NumericInput className= 'Declination'
                      label = 'Declination'
                      max = {90}
                      min = {-90}
                      disabled={!setFov}
                      onValueChanged={(value) => setEquatorialAim(target.ra, value)}
                      step = {0.1}
                      value = {parseFloat(target.dec.toFixed(precision))}
                      placeholder={`value 2`}
                      />
                </Row>
                <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
                  { colors.map((color, index) => (
                    <NumericInput
                      className= {colorData[index]}
                      label = {colorData[index]}
                      max = {255}
                      min = {0}
                      onValueChanged={(value) => {
                        let newColor = colors;
                        newColor[index] = value;
                        setBorderColor(newColor);
                      } }
                      step = {1}
                      value = {color}
                      placeholder={`value ${index}`}
                    />
                  ))}
                </Row>
                <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
                  { size.map((value, index) => (
                    <NumericInput
                      className= {sizeData[index]}
                      label = {sizeData[index]}
                      max = {1}
                      min = {0.1}
                      onValueChanged={(value) => {
                        let newSize = size.map((value) => value * 2);
                        newSize[index] = value * 2;
                        setScreenSpaceSize(newSize);
                      } }
                      step = {0.1}
                      value = {parseFloat(value.toFixed(precision))}
                      placeholder={`value ${index}`}
                    />
                  ))}
                </Row>
      </ScrollOverlay>
    }

    handleDeleteTab(tabToDelete) {
        // Call function handle from WWTPanel that is sent as a prop, to call Lua function removeTargetBrowserPair
    }

    onResizeStop(e, direction, ref, delta) {
        this.setState({
            height: this.state.height + delta.height
        })

    }

    onResize(e, direction, ref, delta) {
        this.setState({
            currentHeight: this.state.height + delta.height
        })
        this.props.viewComponentProps.setCurrentTabHeight(this.state.currentHeight);
    }

    render() {
        const {data, currentPopoverHeight, targets, currentTarget} = this.props;
        let {setFov, setBorderColor, setEquatorialAim, setScreenSpaceSize} = this.props;
        const currentlySelectedTarget = targets[currentTarget];

        return(
            <section {...this.inheritedProps} className={styles.tabContainer}>
                <Resizable
                enable={{ top: true, bottom: false }}
                handleClasses={{ top: styles.topHandle }}
                size={{ height: this.state.currentHeight }}
                minHeight={130}
                maxHeight={currentPopoverHeight}
                onResizeStop={this.onResizeStop}
                onResize={this.onResize}>
                {this.createTabs()}
                <div className={styles.tabContent} style={{ height: this.state.currentHeight }}>
                  {this.state.showSettings ? this.createSettings(currentlySelectedTarget, setFov, setBorderColor, setEquatorialAim, setScreenSpaceSize)
                    : this.createImageList(data, this.props)}
                </div>
            </Resizable>
            </section>
        )
    };
}

SkybrowserTabs.propTypes = {
    children: PropTypes.node,
    data: PropTypes.array.isRequired,
    viewComponent: PropTypes.elementType,
    viewComponentProps: PropTypes.object,

};

SkybrowserTabs.defaultProps = {
    children: '',
    viewComponent: (props) => (<li>{ JSON.stringify(props) }</li>),
    viewComponentProps: {},
};

export default SkybrowserTabs;
