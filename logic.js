// checking connection
console.log("This is a test");

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'   

})

let topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let baseMaps = {
        "Street Map" : street,
        "Topographic Map": topography
};

let earthquakes = new L.layerGroup();

let overlayMaps = {
    Earthquakes: earthquakes
};


let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3.5,
    layers: [street, earthquakes]
});

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);


// earthquake data

let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
d3.json(queryUrl).then(function (data) {
    console.log(data);


    function markerSize(magnitude) {
    return magnitude * 4
    }

    function markerColor(depth) {
        return depth > 150 ? '#d73021' :
        depth > 100 ? '#f46d61' :
        depth > 75 ? '#fdae75' :
        depth > 50 ? '#fee085' :
        depth > 15 ? '#e0f3f5' :
        depth > 10 ? '#abd9e4' :
        depth > 5 ? '#74add2' :
                    '#4575b3';
    }



function styleInfo(feature) {
    return {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };
}

L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);

    },

    style: styleInfo,

    onEachFeature: function onEachFeature(feature, layer) {
        layer.bindPopup(`
        <h3>${feature.properties.place}</h3>
        <hr>
        <p>${new Date(feature.properties.time)}</p>
        <h3>Magnitude: ${feature.properties.mag.toLocaleString()}</h3>
        <h3>Depth: ${feature.geometry.coordinates[2].toLocaleString()}</h3>
        `);
    }
}).addTo(earthquakes);


let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 5, 10, 15, 50, 75, 100, 150],
        labels = []

    div.innerHTML += 'Depth (km) <br>'
    for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);


let info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Earthquake Information</h4>' + (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Click on a circle');
};

info.addTo(myMap);



//code above this line!! Nothing below!!
});
