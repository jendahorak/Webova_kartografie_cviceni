'use strict';
window.onload = function () {
  // iniciace mapy
  const decin_lat_lon = [50.78215, 14.21478];
  const main_map = L.map('map', { fullscreenControl: true }).setView(decin_lat_lon, 10);

  // linky na podkladove mapy
  const MAPBOX_URL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
  const GOOGLE_URL = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2';
  const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const CARTO_URL = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/' + 'light_all/{z}/{x}/{y}.png';

  // vytvoreni podkladovych map objektů
  const MAPBOX = L.tileLayer(MAPBOX_URL, {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiamVuZGEtaG9yYWsiLCJhIjoiY2t3YXBjZzMxM2Q3dTJ1cm9sNWI5MDk5NiJ9.rVDUs6fIElcYyH5LXn5Geg',
  });
  const GMAP = L.tileLayer(GOOGLE_URL, {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  });
  const OSM = L.tileLayer(OSM_URL, {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  });
  const CARTO = L.tileLayer(CARTO_URL);

  main_map.addLayer(OSM);

  // definice pro l.control
  const BASELAYERS = {
    OSM: OSM,
    CARTO: CARTO,
    'Google Maps': GMAP,
    MapBox: MAPBOX,
  };
  const OVERLAYS = {};
  const LAYERCTRL = L.control.layers(BASELAYERS, OVERLAYS);

  // plugin na icony pro podkladove mapy
  var iconLayersControl = new L.Control.IconLayers(
    [
      {
        title: 'OSM',
        layer: OSM,
        icon: 'plugins/Leaflet-IconLayers-master/examples/icons/openstreetmap_mapnik.png',
      },
      {
        title: 'CartoDB',
        layer: CARTO,
        icon: 'graphics/backgroundmaps/80_80/carto.PNG',
      },
      {
        title: 'GoogleMaps',
        layer: GMAP,
        icon: 'graphics/backgroundmaps/80_80/google.PNG',
      },
      {
        title: 'MapBox',
        layer: MAPBOX,
        icon: 'graphics/backgroundmaps/80_80/mapbox.PNG',
      },
    ],
    {
      position: 'bottomleft',
      maxLayersInRow: 5,
    },
  );

  iconLayersControl.addTo(main_map);
  main_map.addControl(LAYERCTRL);
  main_map.attributionControl.addAttribution('Zdroj dat: <a href="http://www.zanikleobce.cz/">zanikleobce.cz</a>');

  // custom znak pro zanikla mista
  let zoIcon = L.icon({
    iconUrl: 'graphics/svg/logo_ztracene_obce_fin.svg',
    iconSize: [25, 25],
    popupAnchor: [0, -20],
  });

  // vrstva okresu
  //   const obec_decin = 'https://raw.githubusercontent.com/jendahorak/personalgeoserver/main/obec_polygon.geojson';
  const obec_decin_maptiler = 'https://api.maptiler.com/data/545cc34a-ae59-4f56-a869-bbce0f28554e/features.json?key=AKmbSShpBnydQXxNUVbK';

  async function fetchObecDecin() {
    try {
      const response = await fetch(obec_decin_maptiler);
      const data = await response.json();

      const OBEC_DECIN = L.geoJSON(data, {
        style: { color: '#19180aff' },
      });

      OBEC_DECIN.bindPopup('<p>Okres Děčín</p>');
      OBEC_DECIN.addTo(main_map);
      LAYERCTRL.addOverlay(OBEC_DECIN, 'okres Děčín');
      main_map.fitBounds(OBEC_DECIN.getBounds());
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // vrstva zaniklych mist
  const obce_url = 'https://raw.githubusercontent.com/jendahorak/personalgeoserver/main/zo_w_links.geojson';

  async function fetchZanikleObce() {
    try {
      const response = await fetch(obce_url);
      const data = await response.json();

      const ZANIKLE_OBCE = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: zoIcon });
        },
      });

      ZANIKLE_OBCE.bindPopup((layer) => {
        const POPUPCONTENT =
          '<h4>' +
          layer.feature.properties.Name +
          '</h4>' +
          '<h4> Typ: ' +
          layer.feature.properties.Typ +
          '</h4>' +
          '<img src="' +
          layer.feature.properties.picture +
          '" style="width:200px;height:auto;">' +
          '<br>' +
          '<a href=';
        return POPUPCONTENT;
      }).addTo(main_map);

      LAYERCTRL.addOverlay(ZANIKLE_OBCE, 'zaniklá místa');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  fetchObecDecin();
  fetchZanikleObce();
};
