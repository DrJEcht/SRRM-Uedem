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
  extent: ol.proj.transformExtent(
    [],
    'EPSG:4326',
    'EPSG:3857'
  )
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

// Adresssuche über Nominatim
function searchAddress() {
  const address = document.getElementById("address").value;
  if (!address) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        const coords = ol.proj.fromLonLat([lon, lat]);

        view.animate({ center: coords, zoom: 16 });
        vectorSource.clear();

        const marker = new ol.Feature({
          geometry: new ol.geom.Point(coords)
        });

        marker.setStyle(new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://cdn.jsdelivr.net/npm/ol@10.0.0/examples/data/icon.png'
          })
        }));

        vectorSource.addFeature(marker);
      } else {
        alert("Adresse nicht gefunden.");
      }
    });
}
