import React, { Component } from "react";
import { render } from "react-dom";
import MapGL, { NavigationControl, GeolocateControl } from "react-map-gl";
import { Editor, EditorModes } from "react-map-gl-draw";

import ControlPanel from "./control-panel";
import { getFeatureStyle, getEditHandleStyle } from "./style";

const TOKEN =
  "pk.eyJ1Ijoic2FnYXIyNDciLCJhIjoiY2sxd2RmdDhuMDBuZjNpczR4Y2d5Y3JtbSJ9.o-lI3ukNJZGZD2034jzE6g"; // Set your mapbox token here

const geolocateStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  margin: 20
};

const navStyle = {
  position: "absolute",
  top: 36,
  left: 0,
  padding: "10px"
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this._editorRef = null;
    this.state = {
      viewport: {
        longitude: -91.874,
        latitude: 42.76,
        zoom: 1
      },
      mode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null
    };
  }

  _updateViewport = viewport => {
    this.setState({ viewport });
  };

  _onSelect = options => {
    this.setState({
      selectedFeatureIndex: options && options.selectedFeatureIndex
    });
  };

  _onDelete = () => {
    const selectedIndex = this.state.selectedFeatureIndex;
    if (selectedIndex !== null && selectedIndex >= 0) {
      this._editorRef.deleteFeatures(selectedIndex);
    }
  };

  _onUpdate = ({ editType }) => {
    if (editType === "addFeature") {
      this.setState({
        mode: EditorModes.EDITING
      });
    }
  };

  _renderDrawTools = () => {
    return (
      <div>
        <div className="mapboxgl-ctrl-top-left">
          <GeolocateControl
            style={geolocateStyle}
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
          />

          <div className="nav" style={navStyle}>
            <NavigationControl />
          </div>
        </div>
        <div className="mapboxgl-ctrl-bottom-left">
          <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
            <button
              className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
              title="Polygon tool (p)"
              onClick={() => this.setState({ mode: EditorModes.DRAW_POLYGON })}
            />
            <button
              className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
              title="Delete"
              onClick={this._onDelete}
            />
          </div>
        </div>
      </div>
    );
  };

  _renderControlPanel = () => {
    const features = this._editorRef && this._editorRef.getFeatures();
    let featureIndex = this.state.selectedFeatureIndex;
    if (features && featureIndex === null) {
      featureIndex = features.length - 1;
    }
    const polygon = features && features.length ? features[featureIndex] : null;
    return <ControlPanel polygon={polygon} viewport={this.state.viewport} />;
  };

  render() {
    const { viewport, mode } = this.state;
    return (
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxApiAccessToken={TOKEN}
        onViewportChange={this._updateViewport}
      >
        <Editor
          ref={_ => (this._editorRef = _)}
          style={{ width: "100%", height: "100%" }}
          clickRadius={12}
          mode={mode}
          onSelect={this._onSelect}
          onUpdate={this._onUpdate}
          editHandleShape={"circle"}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />
        {this._renderDrawTools()}
        {this._renderControlPanel()}
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
