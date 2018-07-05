// let geojsonURL = 'ns_ps.json';
//
// const mkey = 'pk.eyJ1Ijoib2tmZGUiLCJhIjoiY2lpOHhvMnNhMDAyNnZla280ZWhmMm96NyJ9.IvGz74dvvukg19B4Npsm1g';
//
// const options = {
//   lat: 53.5724939,
//   lng: 8.8836309,
//   zoom: 6,
//   style: 'mapbox://styles/okfde/cjhbtc6et0he22smk98a7i8h2',
//   pitch: 10,
// };

var minRange = 0
var maxRange = 7792887
var minColor = '#75b828'
var maxColor = '#0c4216'

var projection = d3.geoMercator()
    .scale(1)
    .translate([0, 0]);

var path = d3.geoPath()
  .projection(projection)

var color = d3.scaleLinear().domain([0, maxRange])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(minColor), d3.rgb(maxColor)])


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height")

var translate = {
  'Income support': 'Direktzahlungen zur Einkommenssicherung und Einkommensstabilisierung',
  'Greening': '“Greening”',
  'Market measures': 'Marktmaßnahmen',
  'Organic farmings': 'Ökologischen Landbau',
  'Environmental measures': 'Agrarumweltmaßnahmen',
  'Investment': 'Investitionen',
  'Rural development etc': 'Förderung der ländlichen Entwicklung'
}

d3.queue()
    .defer(d3.json, "ns_ps.json")
    .defer(d3.json, "postcode_agg.json")
    .defer(d3.csv, "eu-total.csv")
    .defer(d3.json, "top_per_postcode.json")
    .defer(d3.json, "de-DE.json")
    .await(ready)

var div = d3.select("#map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function ready (error, map, stats, eutotal, top, locale) {

  d3.formatDefaultLocale(locale);

  var format = d3.format("$,");

  var b = path.bounds(map),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2]

  projection.scale(s).translate(t)

  svg.selectAll("path")
    .data(map.features)
  .enter().append("path")
    .attr("d", path)
    .style("fill", function (d) {
      var sp = stats[d.properties.postcode]
      var value = 0
      if (sp) {
        value = sp['total']
      }

      return color(value)
    })
    .on('mouseover', function (o, e) {
       // d3.select(this).style('opacity', 0.5)
      var topList = top[o.properties.postcode]
      var tooltipContent =  '<table class="receiver-table">' // '<b>Postcode: ' + o.properties.postcode + '</b><br/><br/>'

      var total = 0
      for (var i = 0; i < topList.length; ++i) {
        total += topList[i][1]
        tooltipContent += `<tr class="receiver-line"><td class="receiver">${topList[i][0]}:</td><td class="spacer"></td> <td class="value">${format(topList[i][1])}</td></tr>`
      }
      tooltipContent += '</table>'


      tooltipContent = `<span class='total-postcode'>${format(total)}</span></br></br>` + tooltipContent
      div.html(tooltipContent)
      .style('left', d3.event.clientX + 'px')
      .style('top', d3.event.clientY + 'px')
      .style('opacity', 1)
       d3.select(this).style('stroke-width', '2px')
      })
    .on('mouseout', function () {
       // d3.select(this).style('opacity', 1)
       d3.select(this).style('stroke-width', '.5px')
      })
}

