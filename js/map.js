// BASEMAP

var map = L.map('mainmap', {scrollWheelZoom: false, attributionControl: false}).setView([40.716303, -73.940535], 10);

var tonerUrl = "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{Z}/{X}/{Y}.png";

var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
});

var basemap = L.tileLayer(url, {
    subdomains: ['','a.','b.','c.','d.'],
    minZoom: 0,
    maxZoom: 20,
    opacity: 0.5,
    type: 'png'
}); 


basemap.addTo(map);

// LINES

map.createPane('lines');

map.getPane('lines').style.zIndex = 650;
map.getPane('lines').style.pointerEvents = 'none';

var tonerUrl = "https://stamen-tiles.a.ssl.fastly.net/toner-lines/{Z}/{X}/{Y}.png";

var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
});

var lines = L.tileLayer(url, {
    subdomains: ['','a.','b.','c.','d.'],
    minZoom: 13,
    maxZoom: 20,
    opacity: 0.3,
    type: 'png',
    attribution: '',
    pane: 'lines'
}); 

lines.addTo(map);

// LABELS 

map.createPane('labels');

map.getPane('labels').style.zIndex = 651;
map.getPane('labels').style.pointerEvents = 'none';

var tonerUrl = "https://stamen-tiles.a.ssl.fastly.net/toner-labels/{Z}/{X}/{Y}.png";

var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
});

var labels = L.tileLayer(url, {
    subdomains: ['','a.','b.','c.','d.'],
    minZoom: 14,
    maxZoom: 20,
    opacity: 0.5,
    type: 'png',
    attribution: '',
    pane: 'labels'
}); 

labels.addTo(map);


// SYMBOLOGY

function getColor(d) 
    {
        return d < -45000 ? '#d73027':
            d < -30000 ? '#f46d43':
            d < -15000 ? '#fdae61':
            d < -5000 ? '#fee08b':
            d < 5000 ? '#ffffbf':
            d < 15000 ? '#d9ef8b':
            d < 30000 ? '#a6d96a':
            d < 45000 ? '#66bd63':
            '#1a9850';
        }

function getBorder(d)
    {
        return d < -45000 ? '#E64F35':
            d < -30000 ? '#F98E52':
            d < -15000 ? '#FEC776':
            d < -5000 ? '#FFF0A5':
            d < 5000 ? '#ECF7A5':
            d < 15000 ? '#C0E47B':
            d < 30000 ? '#86CB67':
            d < 45000 ? '#40AB5A':
            '#0D8044';
        }

function style(feature) {
    return {
    fillColor: getColor(feature.properties.Gap),
    weight: 1.2,
    opacity: 0.9,
    color: getBorder(feature.properties.Gap),
    fillOpacity: 0.9
    };
}

L.geoJson(AMI_data, {style: style}).addTo(map);

//INTERACTION

var geojson;

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#555',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}


function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: highlightFeature
    });
} 

geojson = L.geoJson(AMI_data, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//HOVER TEXT

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info hovertext'); 
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.Name + '</b><br/>' + 
        'Median HH Income: <b>$' + numberWithCommas(Math.abs(props.MHI_2015)) +'</b>.<br/>' + 
        'That&#39;s <b>$' + numberWithCommas(Math.abs(props.Gap)) + ' </b><b class="red">' + props.MHI_is_lower +'</b><b class="green">'+ props.MHI_is_higher + '</b> than AMI.'
        : 'Select a neighborhood');
};

info.addTo(map);

//LEGEND

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

var div = L.DomUtil.create('div', 'info legend'),
    grades = [-45000, -30000, -15000, -5000, 5000, 15000, 30000, 45000, 60000],
    labels = ["$45,000 lower", "", "", "", "About the same", "", "", "", "$45,000 higher"];

        div.innerHTML = div.innerHTML + '<b>Community Income vs. AMI<b><br><br>'
    for (var i = grades.length - 1; i > -1; i--) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] - 1) + '"></i> ' +
                labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map);

//LEGEND TOGGLE 

showLegend = false; 

var toggleLegend = function(){
        if(showLegend === true){
           $('.legend').hide();
           $('.legend-close-button').removeClass('legend-close-button').addClass('legend-toggle-button').html("<b>i</b>");
           showLegend = false;  
        }
        else{
           $('.legend').show(); 
           $('.legend-toggle-button').removeClass('legend-toggle-button').addClass('legend-close-button').html("<b> &#10005;</b>");
           showLegend = true;
        }
    }
