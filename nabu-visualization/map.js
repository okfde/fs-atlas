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
    .defer(d3.csv, "bundesland.csv")
    .await(ready)

var div = d3.select("#map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var myChart

function drawBarChart2(stats, postcode = 'total') {
  var label = (postcode == 'total')?'Niedersachsen':'Postzahl: ' + postcode
  d3.select('#selected-postcode').html('<h2>' + label + '</h2>')

  if (postcode !== 'total') {
    d3.select('#total-button').transition().duration(500).style('opacity', 1)
  } else {
    d3.select('#total-button').transition().duration(500).style('opacity', 0)
  }

  var barChartData = d3.entries(stats[postcode])
  barChartData.pop()

  console.log(barChartData)

   var y = 0
   var minValue = 0
   var maxValue = 0
   var names = []
   var data = []
  for (var i in barChartData) {
    names.push(barChartData[i].key)
    data.push(barChartData[i].value)
  }

  d3.select('#type-plot').remove()
  d3.select('#type-plot-container').html('<canvas id="type-plot" width="400" height="400"></canvas>')
  var ctx = document.getElementById("type-plot");


  myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: names,
          datasets: [{
              label: 'Total',
              data: data,
              backgroundColor: '#62ac84'
          }],
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                    beginAtZero:true,
                  },
                  gridLines: { display: false }
              }],
              xAxes: [{
                  gridLines: {
                    display: false
                  },
                  scaleLabel: { labelString: 'Milliarden', display: true }
              }]
          },
      }
  });


}

function drawBarChart(stats, postcode = 'total') {
  var label = (postcode == 'total')?'Niedersachsen':'Postzahl: ' + postcode
  d3.select('#selected-postcode').html('<h2>' + label + '</h2>')

  if (postcode !== 'total') {
    d3.select('#total-button').transition().duration(500).style('opacity', 1)
  } else {
    d3.select('#total-button').transition().duration(500).style('opacity', 0)
  }

  var barScale = d3.scaleLinear().domain([0, stats[postcode]['total']])
                    .range([0, height])

  var barChartData = d3.entries(stats[postcode])
  barChartData.pop()

   var y = 0
   var minValue = 0
   var maxValue = 0
  for (var i in barChartData) {
    barChartData[i]['height'] = barScale(barChartData[i]['value'])
    barChartData[i]['y'] = y
    y += barChartData[i]['height']
    if (i > 0) {
      minValue = Math.min(barChartData[i]['value'], minValue)
      maxValue = Math.max(barChartData[i]['value'], maxValue)
    } else {
      minValue = barChartData[0]['value']
      maxValue = barChartData[0]['value']
    }
  }

  var barChartColor = d3.scaleLinear().domain([minValue, maxValue])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb(minColor), d3.rgb(maxColor)])

  svg.selectAll('rect').remove()

  svg.selectAll('rect')
      .data(barChartData)
      .enter().append('rect')
                .attr('height', (x,i) => barChartData[i]['height'])
                .attr('x', width - 60)
                .attr('width', 60)
                .attr('y', (x,i) => barChartData[i]['y'])
                .attr('fill', (x,i) => barChartColor(x['value']))
                .on('mouseover', function (d, i) {
                  div.transition()
                      .duration(200)
                      .style("opacity", .9)
                  div .html(translate[d['key']])
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

}

function ready (error, map, stats, eutotal, bundesland) {

  d3.select('#total-button')
        .on('click', () => drawBarChart2(stats, 'total'))

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
       d3.select(this).style('stroke-width', '2px')
      })
    .on('mouseout', function () {
       // d3.select(this).style('opacity', 1)
       d3.select(this).style('stroke-width', '.5px')
      })
    .on('click', function (d) {
       drawBarChart2(stats, Number(d['properties']['postcode']))
    })

  drawBarChart2(stats, 'total')

  var eunames = []
  var eudata = []
  var num = 0

  eutotal = eutotal.splice(0, 28)

  for (var i = 0; i < 28; ++i) {
    eutotal[i]['sum'] = Number(eutotal[i]['sum'].replace(',', '.'))
  }

  eutotal.sort((a,b) => a['sum'] <= b['sum'])

  for (var i = 0; i < 28; ++i) {
    eunames.push(eutotal[i]['name'])
    eudata.push(eutotal[i]['sum'])
  }

  var ctx = document.getElementById("total-eu");
  var myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: eunames,
          datasets: [{
              label: 'Total',
              data: eudata,
              backgroundColor: '#62ac84'
          }],
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                    beginAtZero:true,
                  },
                  gridLines: { display: false }
              }],
              xAxes: [{
                  gridLines: {
                    display: false
                  },
                  scaleLabel: { labelString: 'Milliarden', display: true }
              }]
          },
      }
  });

  var denames = []
  var dedata = []
  var num = 0

  for (var i = 0; i < bundesland.length; ++i) {
    denames.push(bundesland[i]['bundesland'])
    dedata.push(bundesland[i]['sum'])
  }

  var ctx = document.getElementById("total-de");
  var myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: denames,
          datasets: [{
              label: 'Total',
              data: dedata,
              backgroundColor: '#62ac84'
          }],
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                    beginAtZero:true,
                  },
                  gridLines: { display: false }
              }],
              xAxes: [{
                  gridLines: {
                    display: false
                  },
                  scaleLabel: { labelString: 'Milliarden', display: true }
              }]
          },
      }
  });


//   svg.append("g")
//       .attr("class", "kommune")
//     .selectAll("path")
//     .data(map.features)
//     .enter().append("path")
//       .attr("fill", function(d) { return '#ff000'; })
//       .attr("d", path)
//     .append("title")
//       .text(function(d) { return "%"; });
}

// L.mapbox.accessToken = mkey;
// L.mapbox.styleLayer = options.style;
// var map = L.mapbox.map('map')
//     .setView([options.lat, options.lng], options.zoom);


