var data;

//D3.js canvases
var textArea;
var barChartArea;
var heatMap;

//D3.js svg elements
var selectedAreaText;

//variables for selection
var selectedRegion;
var previousSelectedRegion;
var selectedIndex;

var timeIndicatorBarchart;
var timeIndicatorHeatMap;

//color scale
var myColorScale;



//variables for precomputed values
var topValue; //top value in all the data
var labelWidth; //gap size for heatmap row labels
var barWidth; //width of one bar/column of the heatmap

d3.csv("../data/players_all_preprocessed.csv", (d) => {
  return {
    player_id: +d.player_id,
    fifa_version: +d.fifa_version,
    name: d.name,
    player_positions: d.player_positions,
    overall: +d.overall,
    potential: +d.potential,
    value_eur: +d.value_eur,
    wage_eur: +d.wage_eur,
    age: +d.age,
    height_cm: +d.height_cm,
    weight_kg: +d.weight_kg,
    club_team_id: +d.club_team_id,
    club_name: d.club_name,
    league_id: +d.league_id,
    league_name: d.league_name,
    league_level: +d.league_level,
    nationality_id: +d.nationality_id,
    nationality_name: d.nationality_name,
    preferred_foot: d.preferred_foot,
    weak_foot: +d.weak_foot,
    skill_moves: +d.skill_moves,
    release_clause_eur: +d.release_clause_eur,
    pace: +d.pace,
    shooting: +d.shooting,
    passing: +d.passing,
    dribbling: +d.dribbling,
    defending: +d.defending,
    physic: +d.physic,
    attacking_crossing: +d.attacking_crossing,
    attacking_finishing: +d.attacking_finishing,
    attacking_heading_accuracy: +d.attacking_heading_accuracy,
    attacking_short_passing: +d.attacking_short_passing,
    attacking_volleys: +d.attacking_volleys,
    skill_dribbling: +d.skill_dribbling,
    skill_curve: +d.skill_curve,
    skill_fk_accuracy: +d.skill_fk_accuracy,
    skill_long_passing: +d.skill_long_passing,
    skill_ball_control: +d.skill_ball_control,
    movement_acceleration: +d.movement_acceleration,
    movement_sprint_speed: +d.movement_sprint_speed,
    movement_agility: +d.movement_agility,
    movement_reactions: +d.movement_reactions,
    movement_balance: +d.movement_balance,
    power_shot_power: +d.power_shot_power,
    power_jumping: +d.power_jumping,
    power_stamina: +d.power_stamina,
    power_strength: +d.power_strength,
    power_long_shots: +d.power_long_shots,
    mentality_aggression: +d.mentality_aggression,
    mentality_interceptions: +d.mentality_interceptions,
    mentality_positioning: +d.mentality_positioning,
    mentality_vision: +d.mentality_vision,
    mentality_penalties: +d.mentality_penalties,
    mentality_composure: +d.mentality_composure,
    defending_marking_awareness: +d.defending_marking_awareness,
    defending_standing_tackle: +d.defending_standing_tackle,
    defending_sliding_tackle: +d.defending_sliding_tackle,
    goalkeeping_diving: +d.goalkeeping_diving,
    goalkeeping_handling: +d.goalkeeping_handling,
    goalkeeping_kicking: +d.goalkeeping_kicking,
    goalkeeping_positioning: +d.goalkeeping_positioning,
    goalkeeping_reflexes: +d.goalkeeping_reflexes,
    goalkeeping_speed: +d.goalkeeping_speed,
    ls: +d.ls,
    st: +d.st,
    rs: +d.rs,
    lw: +d.lw,
    lf: +d.lf,
    cf: +d.cf,
    rf: +d.rf,
    rw: +d.rw,
    lam: +d.lam,
    cam: +d.cam,
    ram: +d.ram,
    lm: +d.lm,
    lcm: +d.lcm,
    cm: +d.cm,
    rcm: +d.rcm,
    rm: +d.rm,
    lwb: +d.lwb,
    ldm: +d.ldm,
    cdm: +d.cdm,
    rdm: +d.rdm,
    rwb: +d.rwb,
    lb: +d.lb,
    lcb: +d.lcb,
    cb: +d.cb,
    rcb: +d.rcb,
    rb: +d.rb,
    gk: +d.gk,
}
})
.then(function(csvData) {
    data = csvData;
    displayMap();
    init();
    visualization();
  });

/*----------------------
INITIALIZE VISUALIZATION
----------------------*/

function displayMap() {
  d3.svg("../data/maps/world.svg")
    .then((d) => {
    d3.select("#map_div").node().append(d.documentElement)

    d3.select("#map_div").select("svg")
      .attr("id", "map")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("x", 0)
      .attr("y", 0);

    let map = d3.select("body").select("#map");
    map.selectAll("path")
      .style("fill", "lightgray")
      .style("stroke", "gray")
      .style("stroke-width", 3)
      .on("click", function () {
        mapClick(this.id);
      });

    let zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", function(event) {
        map
        .attr("transform", event.transform);
    });

    map.call(zoom);
  })
}

function mapClick(region) {
  console.log(region)

  //remove highlighted outline from previous region
  d3.select("#map").select("#" + previousSelectedRegion).style("stroke", "gray");
  //move selected region to the top layer of the svg graphics (to avoid problems with overlapping contours)
  d3.select("#map").select("#" + selectedRegion).raise();

}

function displayTable() {
  const tableDiv = d3.select("#table_div");

  const table = tableDiv.append("table")
    .attr("id", "player_table");

  const thead = table.append("thead").append("tr");
  thead.append("th").text("Player Name");
  thead.append("th").text("Position");
  thead.append("th").text("Market Value");

  const tbody = table.append("tbody");

  playersData.forEach(player => {
    const row = tbody.append("tr");
    row.append("td").text(player.player_name);
    row.append("td").text(player.position);
    row.append("td").text(player.market_value);
  });

  thead.selectAll("th")
    .on("click", function(event, d) {
      const column = d3.select(this).text().toLowerCase().replace(" ", "_"); // Get column name
      const sortedData = playersData.sort((a, b) => {
        if (column === "player_name" || column === "position") {
          return d3.ascending(a[column], b[column]); // Sort alphabetically
        } else {
          return d3.descending(+a[column].replace('€', '').replace('M', ''), +b[column].replace('€', '').replace('M', '')); // Sort numerically
        }
      });

  tbody.selectAll("tr").remove();
  sortedData.forEach(player => {
    const row = tbody.append("tr");
    row.append("td").text(player.player_name);
    row.append("td").text(player.position);
    row.append("td").text(player.market_value);
  });
});
}


  function init() {  
  //d3 canvases for svg elements
  textArea = d3.select("#text_div").append("svg")
    .attr("width", d3.select("#text_div").node().clientWidth)
    .attr("height", d3.select("#text_div").node().clientHeight);

  barChartArea = d3.select("#barchart_div").append("svg")
    .attr("width", d3.select("#barchart_div").node().clientWidth)
    .attr("height", d3.select("#barchart_div").node().clientHeight);

  heatMap = d3.select("#heatmap_div").append("svg")
    .attr("width", d3.select("#heatmap_div").node().clientWidth)
    .attr("height", d3.select("#heatmap_div").node().clientHeight);


  //computation of top value in all the data
  topValue = 0
  for (let index = 0; index < data.length; index++) {
    for (var key in data[index]) {
      if (key != 'date') {
        if (topValue < data[index][key]) topValue = data[index][key]
      }
    }
  }
  console.log("Top overall value is " + topValue)

  //gap size for heatmap row labels
  labelWidth = (1 / 8) * heatMap.node().clientWidth

  //width of one bar/column of the heatmap
  barWidth = ((7 / 8) * heatMap.node().clientWidth) / data.length

  //initialize color scale
  myColorScale = d3.scaleSequential().domain([0, topValue]).interpolator(d3.interpolatePlasma);

}


/*----------------------
BEGINNING OF VISUALIZATION
----------------------*/
function visualization() {

  drawTextInfo();

  drawBarChart(selectedRegion);

  drawHeatMap();

}

function drawTextInfo() {
  //Draw headline
  textArea.append("text")
    .attr("dx", 20)
    .attr("dy", "3em")
    .attr("class", "headline")
    .text("Criminality Index in Czech Republic");

  //Draw source
  textArea.append("text")
    .attr("dx", 20)
    .attr("dy", "7.5em")
    .attr("class", "subline")
    .text("Data source: mapakriminality.cz")
    .on("click", function () { window.open("https://www.mapakriminality.cz/data/"); });;

  //Draw selection information
  selectedAreaText = textArea.append("text")
    .attr("dx", 20)
    .attr("dy", "10em")
    .attr("class", "subline")
    .text("Selected Region: " + selectedRegion.replace(/_/g, " "));

  //***********************************************************Draw legend************************************************//       
  //get area width/height
  let thisCanvasHeight = textArea.node().clientHeight   
  let thisCanvasWidth = textArea.node().clientWidth    

  //legend scale
  var xscale = d3.scaleLinear()
    .domain([0, topValue])
    .range([0, thisCanvasWidth/2]);

  textArea.append("g")
    .attr("transform", `translate(5,${thisCanvasHeight-30})`)
    .call(d3.axisTop(xscale)) 
  
  //set up a gradient variable for linear gradient
  //this is a storage elemnt that is appended as separate xml tag to svg, but does not result any "graphical output"
  var gradient = textArea.append("linearGradient")
    .attr("id", "svgGradient")
    .attr("x1", "0%")
    .attr("x2", "100%")

  //append gradient "stops" - control points at varius gardient offsets with specific colors
  //you can set up multiple stops, minumum are 2
  gradient.append("stop")
    .attr('offset', "0%") //starting color
    .attr("stop-color", myColorScale(0));

  gradient.append("stop")
    .attr('offset', "50%") //middle color
    .attr("stop-color",  myColorScale(topValue/2));
    

  gradient.append("stop")
    .attr('offset', "100%") //end color
    .attr("stop-color",  myColorScale(topValue));


  //append rectangle with gradient fill  
  textArea.append('rect')
    .attr("x", 5)
    .attr("y", thisCanvasHeight -30) 
    .attr("width", thisCanvasWidth/2)
    .attr("height", 18)
    .attr("stroke", "white")
    .attr("fill", "url(#svgGradient)") //gradient color fill is set as url to svg gradient element
    .style("stroke-width", 3)


function drawBarChart(region) {

  //clear all child nodes from barchart SVG canvas (all rects and texts)
  barChartArea.selectAll("*").remove()

  //get area width/height
  let thisCanvasHeight = barChartArea.node().clientHeight

  //interate over rows in the data
  for (let index = 0; index < data.length; index++) {

    //compute old bar height with respect to the represented value and availible space
    var previousBarHeight = (data[index][previousSelectedRegion] / topValue) * thisCanvasHeight

    //compute new bar height with respect to the represented value and availible space
    var barHeight = (data[index][region] / topValue) * thisCanvasHeight



    //append a bar to the barchart
    barChartArea.append('rect') 
      .attr("x", labelWidth + index * barWidth)//attributes before transition
      .attr("y", thisCanvasHeight - previousBarHeight)
      .attr("width", barWidth + 1)
      .attr("height", previousBarHeight)
      .attr("fill", "darkblue")
      .on("click", function () { chartClick(index); }) //registering the click event and folow up action
      .transition() //transition animation
        .duration(1000)
        .attr("y", thisCanvasHeight - barHeight)//attributes after transition
        .attr("height", barHeight)
  }

  //intialize year variable
  var year = ""

  //iterate over rows in the data
  for (let index = 0; index < data.length; index++) {

    //test for change of the year, if the year changes, append the text label to the barchart
    if (data[index].date.substr(0, 4) != year) {

      year = data[index].date.substr(0, 4)

      barChartArea.append("text")
        .attr("x", labelWidth + index * barWidth)
        .attr("y", thisCanvasHeight)
        .attr("class", "subline")
        .style('fill', 'white')
        .text(year)
    }
  }

  //append rectagle outlining the selected timepoint
  timeIndicatorBarchart = barChartArea.append('rect')
    .attr("x", labelWidth + selectedIndex*barWidth)
    .attr("y", 0)
    .attr("width", barWidth)
    .attr("height", thisCanvasHeight)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("opacity", 0.7)
    .style("stroke-width", 3)


  var yscale = d3.scaleLinear()
    .domain([0, topValue])
    .range([thisCanvasHeight, 0]);

  barChartArea.append("g")
    .attr("transform", `translate(${labelWidth},0)`)
    .call(d3.axisLeft(yscale))  
}

function drawHeatMap() {

  //get area width/height
  let thisCanvasWidth = heatMap.node().clientWidth
  let thisCanvasHeight = heatMap.node().clientHeight

  //calculate heatmap row height
  var rowHeight = thisCanvasHeight / 14 //we have 14 regions

  //initialize starting position for the rows
  var yPosition = 0

  //iterate over different regions - i.e., columns of the data; skip date column and whole Czech Republic 
  for (var key in data[0]) {
    if (key != 'date' && key != 'Czech_Republic') {

      //append region label
      heatMap.append("text")
        .attr("x", labelWidth)
        .attr("y", yPosition + rowHeight)
        .attr("class", "subline")
        .attr("text-anchor", "end") //text alignment anchor - end means that the 'x' postion attribute will specify the position of the text end (value can be start/middle/end)
        .style('fill', 'white')
        .style("font-size", rowHeight)
        .text(key.replace(/_/g, " ")) //specify the text, the replace fuction with regex expression '/_/g' is used to find all underscores in the string and replace them with space character

      //iterate over the values for the region  
      for (let index = 0; index < data.length; index++) {

        //skip zero values (missing data for Prague)
        if (data[index][key] != 0) {

          //append rectagle representing the value to heatmap
          heatMap.append('rect')
            .attr("x", labelWidth + index * barWidth)
            .attr("y", yPosition)
            .attr("width", barWidth)
            .attr("height", rowHeight)
            .attr("fill", myColorScale(data[index][key]))          
            .on("click", function () { chartClick(index); })
        }
      }

      //after each region, increase yPosition of the heatmap row
      yPosition += rowHeight
    }
  }

  //append rectagle outlining the selected timepoint
  timeIndicatorHeatMap = heatMap.append('rect')
    .attr("x", labelWidth + selectedIndex*barWidth)
    .attr("y", 0)
    .attr("width", barWidth)
    .attr("height", thisCanvasHeight)
    .attr("fill", "none") 
    .attr("stroke", "white")
    .attr("opacity", 0.7) 
    .style("stroke-width", 3)

}

/*----------------------
INTERACTION
----------------------*/


function chartClick(index) {
  console.log(index)
  selectedIndex = index;

  //iterate over regions
  for (var key in data[index]) {
    if (key != 'date') {

      var color = myColorScale(data[index][key])

      //for zero values (in our case missing values for Prague), set the color to gray
      if (data[index][key] == 0) {
        color = "gray"
      }

      //set the region color to computed color
      d3.select("#" + key).style('fill', color)
    }
  }

  //update the position of the selected timepoint indicator
  timeIndicatorBarchart.attr('x', labelWidth + index * barWidth)
  timeIndicatorHeatMap.attr('x', labelWidth + index * barWidth)

}}
