// EPSG:25832 definieren
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
ol.proj.proj4.register(proj4);

// Attribution
const attribution = new ol.control.Attribution({
  collapsible: false,
});

const key = 'EdafZNDsmwFgAOzJWLIw'; // <-- Dein MapTiler API Key

const projection = ol.proj.get('EPSG:3857');

// Zoomlevel 11 bis 16
const matrixIds = ['11', '12', '13', '14', '15', '16'];
const resolutions = matrixIds.map(z => 156543.03392804097 / Math.pow(2, z));

// WMTS Layer von MapTiler
const wmtsLayer = new ol.layer.Tile({
  opacity: 0.8,
  source: new ol.source.WMTS({
    url: `https://api.maptiler.com/tiles/01970dc0-307a-7225-9efb-70ef1de872ad/{TileMatrix}/{TileCol}/{TileRow}.webp?key=${key}`,
    layer: 'Ohne Versickerung',
    matrixSet: 'GoogleMapsCompatible256-z11-16',
    format: 'image/webp',
    style: 'default',
    wrapX: true,
    requestEncoding: 'REST',
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projection.getExtent()),
      resolutions: resolutions,
      matrixIds: matrixIds,
      tileSize: 256
    })
  })
});

const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});

// View
const view = new ol.View({
  center: ol.proj.fromLonLat([6.274640, 51.666852]),
  zoom: 16,
});

// Karte initialisieren
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, wmtsLayer],
  controls: ol.control.defaults.defaults({ attribution: false }).extend([attribution]),
  view: view
});

// Marker Layer für Suche
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({ source: vectorSource });
map.addLayer(vectorLayer);

// 🔍 Adresse suchen
const searchBtn = document.getElementById('searchBtn');
const addressInput = document.getElementById('addressInput');
const result = document.getElementById('result');

searchBtn.addEventListener('click', () => {
  const address = addressInput.value.trim();
  if (!address) {
    result.textContent = 'Bitte gib eine Adresse ein.';
    return;
  }
  result.textContent = 'Suche...';

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        result.textContent = 'Keine Ergebnisse gefunden.';
        return;
      }

      const place = data[0];
      const lon = parseFloat(place.lon);
      const lat = parseFloat(place.lat);
      const coord = ol.proj.fromLonLat([lon, lat]);

      view.animate({
        center: coord,
        zoom: 18,
        duration: 1000
      });

      vectorSource.clear();
      const marker = new ol.Feature({
        geometry: new ol.geom.Point(coord)
      });
      marker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: 'https://cdn.jsdelivr.net/npm/ol@10.0.0/examples/data/icon.png'
        })
      }));
      vectorSource.addFeature(marker);

      // ✅ Ergebnis anzeigen und nach kurzer Zeit ausblenden
      result.innerHTML = `<b>${place.display_name}</b>`;
      setTimeout(() => {
        result.textContent = '';
      }, 5000); // 3 Sekunden
    })
    .catch(err => {
      result.textContent = 'Fehler bei der Suche: ' + err.message;
    });
});

const opacitySlider = document.getElementById('opacitySlider');
opacitySlider.addEventListener('input', (event) => {
  const value = parseFloat(event.target.value);
  wmtsLayer.setOpacity(value);
});
