import React, {PureComponent} from 'react';
import area from '@turf/area';
const defaultContainer = ({children}) => <div className="control-panel">{children}</div>;

export default class ControlPanel extends PureComponent {
  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const polygon = this.props.polygon;
    const polygonArea = polygon && area(polygon);
    return (
      <Container>
        
        <h6>Latitude: {this.props.viewport.latitude.toFixed(2)}</h6>
        <h6>Longitude: {this.props.viewport.longitude.toFixed(2)}</h6>
        <h6>Zoom: {this.props.viewport.zoom ^ 0}</h6>

        {polygon && (
          <p>
            {polygonArea.toFixed(2)} <br />
            square meters
          </p>
        )}

      </Container>
    );
  }
}
