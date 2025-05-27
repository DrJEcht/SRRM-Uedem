import 'https://cdn.jsdelivr.net/npm/ol@10.0.0/ol.css';
import Map from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/Map.js';
import View from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/View.js';
import TileLayer from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/layer/Tile.js';
import OSM from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/source/OSM.js';
import TileWMS from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/source/TileWMS.js';
import {fromLonLat} from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/proj.js';
import {toLonLat} from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/proj.js';
import {Feature} from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/Feature.js';
import Point from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/geom/Point.js';
import VectorLayer from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/layer/Vector.js';
import VectorSource from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/source/Vector.js';
import Style from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/style/Style.js';
import Icon from 'https://cdn.jsdelivr.net/npm/ol@10.0.0/style/Icon.js';

// Basis Layer
const osmLayer = new TileLayer({
  source: new OSM()
});

// Beispiel-WMS Layer (DWD Radarbild als WMS)
const wmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'https://maps.dwd.de/geoserver/dwd/ows?',
    params: {
      'LAYERS': 'dwd:FX-Produkt',
      'TILED': true,
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    ratio: 1,
    serverType: 'geoserver'
  })
});

// Karte initialisieren
const map = new Map({
  target: 'map',
  layers: [osmLayer, wmsLayer],
  view: new View({
    center: fromLonLat([10.4515, 51.1657]), // Zentrum Deutschland
    zoom: 6
  })
});

// Vektorquelle für Suchmarker
const vectorSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: vectorSource
});
map.addLayer(markerLayer);

// Suche
document.getElementById('search-button').addEventListener('click', () => {
  const address = document.getElementById('address').value;
  if (!address) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        const coord = fromLonLat([lon, lat]);

        // Karte bewegen
        map.getView().animate({center: coord, zoom: 16});

        // Marker setzen
        vectorSource.clear();
        const marker = new Feature({
          geometry: new Point(coord)
        });
        marker.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'https://cdn.jsdelivr.net/npm/ol@10.0.0/examples/data/icon.png'
          })
        }));
        vectorSource.addFeature(marker);
      } else {
        alert("Adresse nicht gefunden.");
      }
    });
});
