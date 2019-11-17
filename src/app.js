import React, { Component, useState } from "react";
import { render } from "react-dom";
import MapGL, { NavigationControl, GeolocateControl } from "react-map-gl";
import { Editor, EditorModes } from "react-map-gl-draw";
import { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import DatePicker from "react-datepicker";

import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-datepicker/dist/react-datepicker.css";

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

const datePickerStyle = {
  position: "absolute",
  top: 60,
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
      searchResultLayer: null,
      mode: EditorModes.READ_ONLY,
      selectedFeatureIndex: null,
      startDate: new Date(),
      endDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 3, 
        new Date().getDate()
      )
    };
  }

  mapRef = React.createRef();

  _updateViewport = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
  };

  _updateGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 2000 };
    return this._updateViewport({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  };

  _onResult = event => {
    console.log(event);
    this.setState({
      searchResultLayer: new GeoJsonLayer({
        id: "search-result",
        data: event.result.geometry,
        getFillColor: [255, 0, 0, 128],
        getRadius: 1000,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 10
      })
    });
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
    const { startDate, setStartDate } = this.state;
    const { endDate, setEndDate } = this.state;
    return (
      <div style={{ height: "100vh" }}>
        <MapGL
          ref={this.mapRef}
          {...viewport}
          width="100%"
          height="100%"
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxApiAccessToken={TOKEN}
          onViewportChange={this._updateViewport}
        >
          <div style={{border: "1px solid red"}}>
          <Geocoder
            mapRef={this.mapRef}
            onResult={this._onResult}
            onViewportChange={this._updateViewport}
            mapboxApiAccessToken={TOKEN}
            position="top-right"
          />
          <DatePicker
            selected={this.state.endDate}
            onChange={date => this.setState({endDate: date})}
            selectsEnd
            endDate={this.state.endDate}
            minDate={this.state.startDate}
          />
          <DatePicker
            selected={this.state.startDate}
            onChange={date => this.setState({startDate: date})}
            selectsStart
            startDate={this.state.startDate}
            endDate={this.state.endDate}
          />
          </div>

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
      </div>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
