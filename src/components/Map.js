import React from 'react';
import ReactDOM from 'react-dom';
import PopUpForm from './PopUpForm';
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux';
import { startAddPlace } from '../actions/places';
import { setMap } from '../actions/map';

class Map extends React.Component {
  state = {
      addLocationInfowindow: undefined,
      activeMarkerInfowindow: undefined,
      markers: []
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google){
      console.log('componentDidUpdate');
      this.loadMap();
    }

    if(prevProps.places !== this.props.places) {
      console.log('props.places changed');
      this.renderMarkersOnMap();
    }
  }

  componentDidMount() {
    this.loadMap();
  }

  loadMap() {
    if (this.props && this.props.google) {
      // google is available
      const {google} = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);

      const {initialCenter, zoom} = this.props;
      const {lat, lng} = initialCenter;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = Object.assign({}, {
        center,
        zoom
      })
      this.map = new maps.Map(node, mapConfig);
      this.props.setMap(this.map);

      this.renderMarkersOnMap();
      

      // pop up add place
      this.map.addListener('click', (e) => {
        this.closeOpenedInfoWindow();
        const popUp = <PopUpForm onSubmit={this.onSubmit}/>;
        const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        this.showPopupOnMap(position, popUp);

        google.maps.event.addListener(this.state.addLocationInfowindow, 'domready', () => {
          document.getElementById('popUp').addEventListener('submit', (e) => {
            e.preventDefault();
            this.props.startAddPlace({
              position,
              title: e.target.elements.location.value
            });
            this.closeOpenedInfoWindow();
            this.renderMarkersOnMap();
          })
        });
      })
    }   
}

clearMarkers = () => {
  console.log('clear markers');
  if(this.state.markers) {
    this.state.markers.map((marker) => {
      marker.setMap(null);
    })
  }
  this.setState({ markers: [] });
}

renderMarkersOnMap = () => {
  console.log(this.state.markers)
  this.clearMarkers();
  let markers = [];
    this.props.places.map((place) => {

      const marker = new google.maps.Marker({
        position: place.position,
        map: this.map,
        title: place.title
      });

      markers.push(marker);

      const markerInfowindow = new google.maps.InfoWindow({
        content: `<h5>${place.title}</h5>`
      });

      marker.addListener('click', () => {
        this.closeOpenedInfoWindow();
        this.setState({
          activeMarkerInfowindow: markerInfowindow
        })
        markerInfowindow.open(this.map, marker);
      });
  });

  this.setState({ markers });
}

closeOpenedInfoWindow = () => {
  if(this.state.activeMarkerInfowindow){
    this.state.activeMarkerInfowindow.close();
  }
  if(this.state.addLocationInfowindow){
    this.state.addLocationInfowindow.close();
  }
}

showPopupOnMap = (position, popUp) => {
  const content = ReactDOMServer.renderToString(popUp)
  this.setState({
    addLocationInfowindow: new google.maps.InfoWindow({
      content,
      position
    })
  })
  this.state.addLocationInfowindow.open(this.map)
}

render() {
    const style = {
      width: '70vw',
      height: '70vh'
    }

    return (
      <div  ref="map" style={style}>
        loading map...
      </div>
    )
  }
};

Map.defaultProps = {
  zoom: 11,
  initialCenter: {
    lat: 59.3293,
    lng: 18.0686
  }
}

const mapStateToProps = (state) => {
  return {
      places: state.places
  };
};

const mapDispatchToProps = (dispatch) => (
  { startAddPlace: (place) => dispatch(startAddPlace(place)),
    setMap: (map) => dispatch(setMap(map))
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Map);