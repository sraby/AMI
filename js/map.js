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

// LABELS

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

function avgcolor(color1,color2){
    var avg  = function(a,b){ return (a+b)/2; },
        t16  = function(c){ return parseInt((''+c).replace('#',''),16) },
        hex  = function(c){ return (c>>0).toString(16) },
        hex1 = t16(color1),
        hex2 = t16(color2),
        r    = function(hex){ return hex >> 16 & 0xFF},
        g    = function(hex){ return hex >> 8 & 0xFF},
        b    = function(hex){ return hex & 0xFF},
        res  = '#' + hex(avg(r(hex1),r(hex2))) 
                   + hex(avg(g(hex1),g(hex2))) 
                   + hex(avg(b(hex1),b(hex2)));
    return res;
}

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
        return d < -45000 ? avgcolor('#d73027','#f46d43'):
            d < -30000 ? avgcolor('#f46d43','#fdae61'):
            d < -15000 ? avgcolor('#fdae61','#fee08b'):
            d < -5000 ? avgcolor('#fee08b','#ffffbf'):
            d < 5000 ? avgcolor('#ffffbf','#d9ef8b'):
            d < 15000 ? avgcolor('#d9ef8b','#a6d96a'):
            d < 30000 ? avgcolor('#a6d96a','#66bd63'):
            d < 45000 ? avgcolor('#66bd63','#1a9850'):
            avgcolor('#1a9850','#006837');
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
    this._div = L.DomUtil.create('div', 'info hovertext'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
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

// loop through our density intervals and generate a label with a colored square for each interval

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

showLegend = false;  // default value showing the legend

var toggleLegend = function(){
        if(showLegend === true){
        /* use jquery to select your DOM elements that has the class 'legend' */
           $('.legend').hide(); 
           $('#legend-toggle-button').html("<b>i</b>").css({'background':'#444','color':'#fff'});
           //$('#legend-toggle-button:hover').css('background','#2DBED9');
           showLegend = false; 
        }
        else{
           $('.legend').show();
           $('#legend-toggle-button').html("<b>x</b>").css({'background':'rgba(0,0,0,0)','color':'#444'}).not(":hover");
           //$('#legend-toggle-button:hover').css('background','#2DBED9');
           showLegend = true; 
        }
    }


