"use strict";
window.onload = function () {
    // iniciace mapy
    const decin_lat_lon = [50.78215, 14.21478];
    const main_map = L.map("map", { fullscreenControl: true,}).setView(decin_lat_lon, 10);

    // linky na podkladove mapy
    const MAPBOX_URL =
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
    const GOOGLE_URL =
        "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2";
    const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const CARTO_URL =
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/" +
        "light_all/{z}/{x}/{y}.png";

    // vytvoreni podkladovych map objektů
    const MAPBOX = L.tileLayer(
        MAPBOX_URL,
        {
            attribution:
                'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
                "pk.eyJ1IjoiamVuZGEtaG9yYWsiLCJhIjoiY2t3YXBjZzMxM2Q3dTJ1cm9sNWI5MDk5NiJ9.rVDUs6fIElcYyH5LXn5Geg",
        }
    );
    const GMAP = L.tileLayer(GOOGLE_URL, {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    });
    const OSM = L.tileLayer(OSM_URL, { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' });
    const CARTO = L.tileLayer(CARTO_URL);

    main_map.addLayer(OSM)


    // definice pro l.control
    const BASELAYERS = {
        "OSM": OSM,
        "CARTO": CARTO,
        "Google Maps": GMAP,  
        "MapBox": MAPBOX
    };
    const OVERLAYS = {};
    const LAYERCTRL = L.control.layers(BASELAYERS, OVERLAYS);

    // plugin na icony pro podkladove mapy
    var iconLayersControl = new L.Control.IconLayers(
        [
            {
                title: 'OSM', 
                layer: OSM, 
                icon: 'plugins/Leaflet-IconLayers-master/examples/icons/openstreetmap_mapnik.png'
            },
            {
                title: 'CartoDB',
                layer: CARTO,
                icon: 'graphics/backgroundmaps/80_80/carto.PNG'
            },
            {
                title: 'GoogleMaps',
                layer: GMAP,
                icon: 'graphics/backgroundmaps/80_80/google.PNG'
            },
            {
                title: 'MapBox',
                layer: MAPBOX,
                icon: 'graphics/backgroundmaps/80_80/mapbox.PNG',
            }

        ], {
            position: 'bottomleft',
            maxLayersInRow: 5
        }
    );

    iconLayersControl.addTo(main_map);
    main_map.addControl(LAYERCTRL);
    main_map.attributionControl.addAttribution('Zdroj dat: <a href="http://www.zanikleobce.cz/">zanikleobce.cz</a>')



    // custom znak pro zanikla mista
    let zoIcon = L.icon({
        iconUrl: 'graphics/svg/logo_ztracene_obce_fin.svg',
        iconSize: [25, 25],
        popupAnchor: [0, -20],
    });


    // vrstva okresu
    const obec_decin = 'https://zelda.sci.muni.cz/geoserver/webovka/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webovka%3AHORAK_obec_polygon_decin&maxFeatures=50&outputFormat=application%2Fjson'

    function polygon_style(feature) {
        return {
          color: '#19180aff',
        };
      }

    fetch(obec_decin)
        .then(response => response.json())
            .then(data => {
                const OBEC_DECIN = L.geoJSON(data,{
                    style:polygon_style
                })
                
                OBEC_DECIN
                    .bindPopup('<p>Okres Děčín</p>')

                OBEC_DECIN.addTo(main_map)

                LAYERCTRL.addOverlay(OBEC_DECIN, "okres Děčín")
                main_map.fitBounds(OBEC_DECIN.getBounds());
            })


    // vrstva zaniklych mist
    const obce_url = 'https://zelda.sci.muni.cz/geoserver/webovka/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webovka%3Azo_w_links_utf8&maxFeatures=50&outputFormat=application%2Fjson'

    fetch(obce_url)
        .then(response => response.json())
            .then(data => {

                const ZANIKLE_OBCE = L.geoJSON(data, {
                    pointToLayer: function(feature, latlng) {
                        return L.marker(latlng, {icon:zoIcon});
                    } 
                })

                ZANIKLE_OBCE
                    .bindPopup(layer => {
                        const POPUPCONTENT = '<h4>'+ layer.feature.properties.Name +'</h4>' + '<h4> Typ: ' + layer.feature.properties.Typ + '</h4>' + '<img src="'+ layer.feature.properties.picture +'" style="width:200px;height:auto;">' +  '<br>' + '<a href='+layer.feature.properties.zo_link+'>Více informací</a>'
                        return POPUPCONTENT;
                    })
                    .addTo(main_map)
                LAYERCTRL.addOverlay(ZANIKLE_OBCE, "zaniklá místa")
    });

};
