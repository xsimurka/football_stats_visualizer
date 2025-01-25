var allVersionsData;
var selectedYearData;

var selectedYearLeagueCountriesSet;
var selectedYearNationalitiesSet;
var selectedYearDisplayedSet;

var mapGeoLayer;
var selectedPlayersTable

var playerValueTimeLine;
var playerWageTimeLine;
var playerRadarChart;

var referencePlayerId;
var comparedPlayerId = null;

var selectedCountry;
var selectedCountryHasMultipleLeagues;
var selectedLeague;
var selectedClub;

const MULTIPLE_LEAGUE_COUNTRIES = new Set(["United Kingdom", "Italy", "Germany", "France", "Spain"])

// Attributes to compare
const PLAYER_ATTRIBUTES = [
  "attacking_crossing",
  "attacking_finishing",
  "attacking_heading_accuracy",
  "attacking_short_passing",
  "attacking_volleys",
  "skill_dribbling",
  "skill_curve",
  "skill_fk_accuracy",
  "skill_long_passing",
  "skill_ball_control",
  "movement_acceleration",
  "movement_sprint_speed",
  "movement_agility",
  "movement_reactions",
  "movement_balance",
  "power_shot_power",
  "power_jumping",
  "power_stamina",
  "power_strength",
  "power_long_shots",
  "mentality_aggression",
  "mentality_interceptions",
  "mentality_positioning",
  "mentality_vision",
  "mentality_penalties",
  "mentality_composure",
  "defending_marking_awareness",
  "defending_standing_tackle",
  "defending_sliding_tackle",
];

const GOALIE_ATTRIBUTES = [
  "goalkeeping_diving",
  "goalkeeping_handling",
  "goalkeeping_kicking",
  "goalkeeping_positioning",
  "goalkeeping_reflexes",
  "goalkeeping_speed",
]

const COLORS = [
  "#ffb3ba", // Pastel Pink
  "#ff7f50", // Coral
  "#ffcc00", // Bright Yellow
  "#00ff7f", // Spring Green
  "#00bfff", // Deep Sky Blue
  "#8a2be2", // Blue Violet
  "#ff69b4", // Hot Pink
  "#98fb98", // Pale Green
  "#ff6347", // Tomato
  "#ffa07a", // Light Salmon
  "#ffff00", // Yellow
  "#ffd700", // Gold
];

d3.csv("players_all_preprocessed.csv", (d) => {
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
    league_country: d.league_country,
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
  .then(function (csvData) {
    allVersionsData = csvData;
    selectedYearData = allVersionsData.filter(row => row.fifa_version === 24)
    selectedYearLeagueCountriesSet = new Set(selectedYearData.map(row => row["league_country"]));
    selectedYearNationalitiesSet = new Set(selectedYearData.map(row => row["nationality_name"]));
    selectedYearDisplayedSet = selectedYearLeagueCountriesSet;
    displayMap();
    showOnlySelectedLabels(selectedYearDisplayedSet)
    selectedPlayersTable = setupPlayersTable();
  });

document.getElementById("fifa_version_select").addEventListener("change", (event) => {
  const selectedVersion = event.target.value;

  selectedYearData = allVersionsData.filter(row => row.fifa_version == selectedVersion)
  selectedYearLeagueCountriesSet = new Set(selectedYearData.map(row => row.league_country));
  selectedYearNationalitiesSet = new Set(selectedYearData.map(row => row.nationality_name));

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  selectedYearDisplayedSet = selectedMode === "league" ? selectedYearLeagueCountriesSet : selectedYearNationalitiesSet;

  setCountryStylesAndInteractivity(mapGeoLayer);
  selectedPlayersTable.setData(selectedYearData);
  playerDisplayStats(selectedPlayersTable.getRows()[0].getData());
  showOnlySelectedLabels(selectedYearDisplayedSet)
});

document.addEventListener("DOMContentLoaded", function () {
  const backButtonLeagues = document.getElementById("back_button_leagues");
  const backButtonTeams = document.getElementById("back_button_teams");
  document.getElementById("fifa_version_select").value = "24";
  document.querySelector('input[name="mode"][value="league"]').checked = true;

  backButtonLeagues.addEventListener("click", backToMap);
  backButtonTeams.addEventListener("click", function () {
    if (selectedCountryHasMultipleLeagues) {
      backToLeagues();
    } else {
      backToMap();
    }
  });
});

function backToMap() {
  document.getElementById("map_div").classList.remove("hide");
  document.getElementById("league_div").classList.remove("show");
  document.getElementById("team_div").classList.remove("show");
  selectedPlayersTable.setData(selectedYearData);
}

function backToLeagues() {
  document.getElementById("team_div").classList.remove("show");
  document.getElementById("league_div").classList.add("show");
  selectedPlayersTable.setData(selectByLeagueCountry(selectedCountry));
}


document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedYearDisplayedSet = event.target.value === "league" ? selectedYearLeagueCountriesSet : selectedYearNationalitiesSet;
    setCountryStylesAndInteractivity(mapGeoLayer);
    selectedPlayersTable.setData(selectedYearData);
    showOnlySelectedLabels(selectedYearDisplayedSet)
  });
});

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function setCountryStylesAndInteractivity() {
  mapGeoLayer.eachLayer((layer) => {
    const countryName = layer.feature.properties.ADMIN;

    if (selectedYearDisplayedSet.has(countryName)) {
      layer.setStyle({
        fillColor: getRandomColor(),
        fillOpacity: 1,
        color: "#333",
        weight: 2,
      });
      layer.options.interactive = true;

    } else {
      layer.setStyle({
        fillColor: "lightgray",
        fillOpacity: 1,
        color: "#333",
        weight: 1,
      });
      layer.options.interactive = false;
    }
  });
}


function displayMap() {
  const southWest = L.latLng(-85, -180); // Bottom-left corner
  const northEast = L.latLng(85, 180);  // Top-right corner
  const bounds = L.latLngBounds(southWest, northEast);

  const map = L.map("map_div", {
    center: [37, 0],
    zoom: 1,
    scrollWheelZoom: true,
    zoomControl: false,
    minZoom: 1,
    attributionControl: false,
  });
  map.setMaxBounds(bounds);
  L.control.zoom({
    position: "bottomleft",
  }).addTo(map);

  fetch("./countries.geojson")
    .then((response) => response.json())
    .then((countryData) => {
      mapGeoLayer = L.geoJSON(countryData, {
        onEachFeature: function (feature, layer) {
          const countryName = feature.properties.ADMIN;
          const countryId = countryName.replace(/\s+/g, "-").toLowerCase(); // Generate a unique ID

          layer.on("click", function () {
            if (layer.options.interactive) {
              selectedCountry = countryName;
              selectedCountryHasMultipleLeagues = MULTIPLE_LEAGUE_COUNTRIES.has(countryName);
              mapClick(countryName);
            }
          });

          const centroid = turf.centroid(feature).geometry.coordinates.reverse();
          const initialZoom = map.getZoom();
          const initialFontSize = Math.max(8, Math.min(initialZoom * 2, 24));

          const label = L.divIcon({
            className: "country-label",
            html: `<div id="label-${countryId}" style="white-space: nowrap; font-size: ${initialFontSize}px; opacity: 0;">${countryName}</div>`,
          });

          const marker = L.marker(centroid, { icon: label, interactive: false });
          marker.addTo(map);
        },
      });

      mapGeoLayer.addTo(map);

      setCountryStylesAndInteractivity(mapGeoLayer);
    });

  map.on("zoom", function () {
    const zoom = map.getZoom();
    const fontSize = Math.max(8, Math.min(zoom * 2, 24));
    const opacity = zoom > 2 ? 1 : 0;

    // Update all country labels by their IDs
    document.querySelectorAll(".country-label > div").forEach((labelDiv) => {
      labelDiv.style.fontSize = `${fontSize}px`;
      labelDiv.style.opacity = labelDiv.style.opacity * opacity;
    });
    showOnlySelectedLabels(selectedYearDisplayedSet);
  });
}

function showOnlySelectedLabels(selectedCountries) {
  const normalizedSelectedCountries = new Set(
    Array.from(selectedCountries).map((country) =>
      country.replace(/\s+/g, "-").toLowerCase()
    )
  );

  // Get all country labels
  document.querySelectorAll(".country-label > div").forEach((labelDiv) => {
    const labelId = labelDiv.id.replace("label-", "");

    // Show only the labels in the selectedCountries set
    if (normalizedSelectedCountries.has(labelId)) {
      labelDiv.style.opacity = 1; // Make visible
    } else {
      labelDiv.style.opacity = 0; // Hide
    }
  });
}

function mapClick(countryName) {
  console.log(`Clicked on: ${countryName}`);

  const radioValue = document.querySelector('input[name="mode"]:checked').value;
  if (radioValue === "nationality") {
    const filteredData = selectByNation(countryName);
    selectedPlayersTable.setData(filteredData);
  } else { // leagues
    document.getElementById("map_div").classList.add("hide");
    let leagues = getUniqueLeaguesByCountry(countryName);
    console.log(leagues);
    if (leagues.size > 1) {
      showLeagues(countryName, leagues);
    } else {
      showTeams(countryName, leagues.values().next().value); // has exactly one
    }
  }
}

function showLeagues(countryName, leagues) {
  console.log(`Showing leagues for: ${countryName}`);

  document.getElementById('league_div').classList.add("show");

  const leagueContainer = document.getElementById('league_grid');
  leagueContainer.innerHTML = '';

  leagues.forEach(league => {
    const leagueWrapper = document.createElement('div');
    leagueWrapper.className = 'league-wrapper';
    const leagueBadge = document.createElement('div');
    leagueBadge.className = 'badge';

    let badge = getLeagueBadgePath(league)
    leagueBadge.style.backgroundImage = `url(${badge})`;
    leagueBadge.style.backgroundSize = 'contain';
    leagueBadge.style.backgroundRepeat = 'no-repeat';
    leagueBadge.style.width = '100px';
    leagueBadge.style.height = '100px';
    leagueBadge.style.margin = '0 auto';

    leagueBadge.onclick = function () {
      selectedLeague = league;
      showTeams(countryName, league);
    };

    const leagueName = document.createElement('div');
    leagueName.className = 'league-name';
    leagueName.textContent = league;
    leagueName.style.textAlign = 'center';
    leagueName.style.marginTop = '10px';
    leagueWrapper.appendChild(leagueBadge);
    leagueWrapper.appendChild(leagueName);
    leagueContainer.appendChild(leagueWrapper);

    const filteredData = selectByLeagueCountry(countryName)
    selectedPlayersTable.setData(filteredData);
  });
}

function showTeams(countryName, leagueName) {
  console.log(`Showing teams for: ${leagueName}`);

  document.getElementById('league_div').classList.remove("show");
  document.getElementById('team_div').classList.add("show");

  const teamContainer = document.getElementById('team_grid');
  teamContainer.innerHTML = '';

  const teams = getLeagueClubIds(countryName, leagueName);

  teams.forEach(team => {
    const clubName = getClubNameById(team);
    const teamBadge = document.createElement('div');
    teamBadge.className = 'badge';
    let logo;
    logo = getClubLogoURL(team, 120)
    let i = new Image();
    i.onload = () => {
      console.log("Was here")
      teamBadge.style.backgroundImage = `url(${logo})`;
    };
    i.onerror = () => {
      teamBadge.style.backgroundImage = `url(./undeffined-logo.png)`;
    };
    i.src = logo;
    teamBadge.style.backgroundSize = 'contain';
    teamBadge.style.backgroundRepeat = 'no-repeat';
    teamBadge.style.width = '100px';
    teamBadge.style.height = '100px';
    teamBadge.style.margin = '0 auto';

    const teamName = document.createElement('div');
    teamName.textContent = clubName;
    teamName.style.textAlign = 'center';
    teamName.style.marginTop = '5px';
    teamBadge.appendChild(teamName);

    teamBadge.onclick = function () {
      selectedClub = clubName;
      console.log(`Clicked on team: ${clubName}`);
      const filteredData = selectByClub(countryName, leagueName, clubName);
      selectedPlayersTable.setData(filteredData);
    };

    teamContainer.appendChild(teamBadge);

    const filteredData = selectByLeague(countryName, leagueName);
    selectedPlayersTable.setData(filteredData);
  });
}


function setupPlayersTable() {
  let table = new Tabulator("#table_div", {
    data: selectedYearData,
    layout: "fitData",
    columns: [
      {
        title: "Name",
        field: "name",
        headerSort: true,
        resizable: false,
        minWidth: 150
      },
      {
        title: "Rating",
        field: "overall",
        headerSort: true,
        resizable: false,
        sorter: "number",
      },
      {
        title: "Age",
        field: "age",
        headerSort: true,
        resizable: false,
        sorter: "number"
      },
      {
        title: "Positions",
        field: "player_positions",
        headerSort: false,
        resizable: false,
        minWidth: 120
      },
      {
        title: "Club",
        field: "club_name",
        headerSort: true,
        resizable: false,
        minWidth: 200
      },
      {
        title: "League",
        field: "league_name",
        headerSort: false,
        resizable: false,
        minWidth: 200
      },
      {
        title: "Nationality",
        field: "nationality_name",
        headerSort: false,
        resizable: false,
        minWidth: 150
      },
    ],
    selectable: false,
    initialSort: [
      { column: "overall", dir: "desc" },
    ],
  });

  let selectedRow = null; // Variable to store the selected row

  function rowFormatter(row) {
    if (row.getPosition() % 2 === 0) {
      row.getElement().style.backgroundColor = "#f0f4f8"; // Even rows have light gray
    } else {
      row.getElement().style.backgroundColor = "#ffffff"; // Odd rows are white
    }

    // Ensure the selected row retains its custom color
    if (selectedRow && selectedRow.getElement() === row.getElement()) {
      row.getElement().style.backgroundColor = 'rgba(42, 157, 143, 0.4)'; // Last clicked row color
    }
  }

  table.on("dataProcessed", function () {
    let firstRow = table.getRows()[0];
    selectedRow = firstRow; // Store the first row as the selected row
    // Select the first row and apply the selected color
    table.getRows().forEach(r => {
      rowFormatter(r); // Use the rowFormatter to restore the original colors
    });
    playerDisplayStats(firstRow.getData()); // Display the stats for the first player

  });

  table.on("rowClick", (e, row) => {
    let selectedPlayer = row.getData();
    selectedRow = row; // Store the clicked row for future reference
    // Restore the row color for all rows before applying the new color to the selected row
    table.getRows().forEach(r => {
      rowFormatter(r); // This will use the default row colors from rowFormatter
    });


    playerDisplayStats(selectedPlayer);
  });

  table.on("rowMouseOver", (e, row) => {
    table.getRows().forEach(r => {
      rowFormatter(r); // This will use the default row colors from rowFormatter
    });
    if (row.getElement() !== selectedRow?.getElement()) {
      row.getElement().style.backgroundColor = 'rgba(236, 14, 14, 0.4)'; // Light red for hovered row
    }

    let inspectedPlayerData = row.getData();
    comparePlayerToReference(inspectedPlayerData);
  });

  return table;
}

function comparePlayerToReference(inspectedPlayerData) {
  if (inspectedPlayerData.player_id == comparedPlayerId) { // inspecting the same player as last time (no change)
    return;
  }
  comparedPlayerId = inspectedPlayerData.player_id;
  let referencePlayerData = selectedYearData.find(d => d.player_id === referencePlayerId);

  PLAYER_ATTRIBUTES.forEach(attr => {
    const inspectedValue = inspectedPlayerData[attr];
    const referenceValue = referencePlayerData[attr];

    const difference = inspectedValue - referenceValue;

    // Update the *_diff span
    const diffElement = document.getElementById(`${attr}_diff`);
    if (diffElement) {
      if (comparedPlayerId == referencePlayerId) {
        diffElement.classList.remove('show');
      } else {
        diffElement.classList.add('show');
      }
      diffElement.textContent = difference > 0 ? `+${difference}` : difference;

      if (difference > 0) {
        diffElement.style.backgroundColor = "green"; // Positive difference
        diffElement.style.color = "white";
      } else if (difference < 0) {
        diffElement.style.backgroundColor = "#de3700"; // Negative difference
        diffElement.style.color = "white";
      } else {
        diffElement.style.backgroundColor = "lightgrey"; // No difference
        diffElement.style.color = "black";
      }
    }
  });

  let dataPoints;

  if (referencePlayerData.player_positions === "GK") {
    dataPoints = [
      +inspectedPlayerData.goalkeeping_diving,
      +inspectedPlayerData.goalkeeping_handling,
      +inspectedPlayerData.goalkeeping_kicking,
      +inspectedPlayerData.goalkeeping_positioning,
      +inspectedPlayerData.goalkeeping_reflexes,
      +inspectedPlayerData.goalkeeping_speed,
    ];
  } else {
    dataPoints = [
      +inspectedPlayerData.pace,
      +inspectedPlayerData.shooting,
      +inspectedPlayerData.passing,
      +inspectedPlayerData.dribbling,
      +inspectedPlayerData.defending,
      +inspectedPlayerData.physic,
    ];
  }

  removeDatasetAtIndex(playerRadarChart, 1);
  if (referencePlayerId != comparedPlayerId) {
    appendDataset(playerRadarChart, dataPoints)
  }

  let timeData;
  removeLine(playerWageTimeLine, 1);
  console.log(referencePlayerId, comparedPlayerId)
  if (referencePlayerId != comparedPlayerId) {
    timeData = getPlayerWages(inspectedPlayerData.player_id);
    addLine(playerWageTimeLine, timeData);
  }
  removeLine(playerValueTimeLine, 1);
  if (referencePlayerId != comparedPlayerId) {
    timeData = getPlayerValues(inspectedPlayerData.player_id);
    addLine(playerValueTimeLine, timeData);
  }
}

function playerDisplayStats(selectedPlayer) {
  referencePlayerId = selectedPlayer.player_id;
  document.getElementById("player_name").textContent = selectedPlayer.name;
  document.getElementById("player_position").textContent = `Position: ${selectedPlayer.player_positions}`;
  document.getElementById("player_age").textContent = `Age: ${selectedPlayer.age}`;
  document.getElementById("player_weight").textContent = `Weight: ${selectedPlayer.weight_kg} kg`;
  document.getElementById("player_height").textContent = `Height: ${selectedPlayer.height_cm} cm`;
  document.getElementById("player_foot").textContent = `Strong Foot: ${selectedPlayer.preferred_foot}`;
  document.getElementById("player_club").textContent = `Club: ${selectedPlayer.club_name}`;
  document.getElementById("player_nationality").textContent = `Nationality: ${selectedPlayer.nationality_name}`;
  document.getElementById("player_rating").textContent = `Rating: ${selectedPlayer.overall}`;
  document.getElementById("player_potential").textContent = `Potential Rating: ${selectedPlayer.potential}`;

  const photoURL = getPlayersPhotoURL(selectedPlayer.player_id, selectedPlayer.fifa_version, 240);
  const playerPhotoDiv = document.getElementById("player_photo");
  let i = new Image();
  i.onload = () => {
    console.log("Was here")
    playerPhotoDiv.style.backgroundImage = `url('${photoURL}')`;
  };
  i.onerror = () => {
    playerPhotoDiv.style.backgroundImage = `url('https://cdn.sofifa.net/player_0.svg')`;
  };
  i.src = photoURL;

  let labels, dataPoints;

  if (selectedPlayer.player_positions === "GK") {
    labels = [
      "Diving",
      "Handling",
      "Kicking",
      "Positioning",
      "Reflexes",
      "Speed",
    ];
    dataPoints = [
      +selectedPlayer.goalkeeping_diving,
      +selectedPlayer.goalkeeping_handling,
      +selectedPlayer.goalkeeping_kicking,
      +selectedPlayer.goalkeeping_positioning,
      +selectedPlayer.goalkeeping_reflexes,
      +selectedPlayer.goalkeeping_speed,
    ];
  } else {
    labels = ["Pace", "Shooting", "Passing", "Dribbling", "Defending", "Physic"];
    dataPoints = [
      +selectedPlayer.pace,
      +selectedPlayer.shooting,
      +selectedPlayer.passing,
      +selectedPlayer.dribbling,
      +selectedPlayer.defending,
      +selectedPlayer.physic,
    ];
  }

  // Create or update the radar chart
  let ctx = document.createElement("canvas");
  let container = document.getElementById("starchart");
  container.innerHTML = ""; // Clear previous chart
  playerRadarChart = createRadarChart(ctx, labels, dataPoints, selectedPlayer.name);
  container.appendChild(ctx);


  updatePlayerStats(selectedPlayer);

  ctx = document.createElement("canvas");
  container = document.getElementById("wage_timeline");
  container.innerHTML = ""; // Clear previous chart
  container.appendChild(ctx);
  let timeData = getPlayerWages(selectedPlayer.player_id);
  playerWageTimeLine = createTimelineChart(ctx, timeData, "Player's Wage")

  ctx = document.createElement("canvas");
  container = document.getElementById("value_timeline");
  container.innerHTML = ""; // Clear previous chart
  container.appendChild(ctx);
  timeData = getPlayerValues(selectedPlayer.player_id);
  playerValueTimeLine = createTimelineChart(ctx, timeData, "Player's Value")

  drawHeatmap(selectedPlayer)

}


function createRadarChart(ctx, labels, dataPoints, playerName) {
  return new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
          borderColor: "rgb(42, 157, 143)", // Chart line color (if any)
          pointBackgroundColor: function (context) {
            const value = context.raw; // Get the value of the point
            return getColor(value);
          },
          pointBorderColor: "#fff", // White border for the points
          pointRadius: 4, // Bigger dots
          borderWidth: 2, // Thinner connecting line
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: 100,
          grid: {
            display: false, // Remove grid lines
          },
          ticks: {
            display: false, // Remove numeric scales (20, 40, etc.)
          },
          pointLabels: {
            font: {
              size: 10,
              weight: "bold", // Make labels bold
            },
            color: "black",
            callback: function (playerName, index) {
              return `${playerName}`;
            },
          },
        },
      },
    },
  });
}

function appendDataset(radarChart, newData, playerName) {
  radarChart.data.datasets.push({
    data: newData,
    backgroundColor: "rgba(0, 0, 0, 0)",/* Fully transparent */
    // Red color with 0.3 opacity
    borderColor: "rgb(236, 14, 14)", // Chart line color
    pointBackgroundColor: function (context) {
      const value = context.raw; // Get the value of the point
      return getColor(value);
    },
    pointBorderColor: "#fff",
    pointRadius: 4, // Bigger dots
    borderWidth: 2, // Thinner connecting line
  });
  radarChart.data.datasets[0].borderColor = "rgba(42, 157, 143, 0.5)"
  radarChart.data.datasets[0].borderWidth = 1,
  radarChart.update();
}

function removeDatasetAtIndex(radarChart, index = 1) {
  if (radarChart.data.datasets.length > index) {
    radarChart.data.datasets.splice(index, 1); // Remove dataset at index 1
    radarChart.data.datasets[0].borderColor = "rgba(42, 157, 143, 1)"
    radarChart.data.datasets[0].borderWidth = 2,
    radarChart.update(); // Update chart to reflect changes
  }
}

function createTimelineChart(ctx, data, label) {
  const maxDataValue = Math.max(...data);

  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024'], // FIFA versions as years
      datasets: [{
        data: data,
        backgroundColor: 'rgba(42, 157, 143, 0.2)', // Fill color under the line
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: '#2a9d8f',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          },
        },
        y: {
          title: {
            display: true,
            text: label
          },
          beginAtZero: false,
          max: maxDataValue * 1.05,
          ticks: {
            callback: function (value) {
              return value === null ? 'N/A' : value.toLocaleString(); // Handle null values
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    }
  });
  return chart;
}

function addLine(chart, newData) {
  chart.data.datasets.push({
    data: newData,
    backgroundColor: 'rgb(236, 14, 14)', // Optional: Line fill color
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 5,
    pointBackgroundColor: "rgb(236, 14, 14)",
    pointBorderWidth: 2
  });
  updateYScale(chart);
  chart.update(); // Update the chart to render the new line
}

function removeLine(chart, index) {
  chart.data.datasets.splice(index, 1); // Remove dataset at specific index
  updateYScale(chart);
  chart.update(); // Update the chart to reflect the changes
}

function updateYScale(chart) {
  // Flatten all data points into a single array and find the maximum
  const allDataPoints = chart.data.datasets.flatMap(dataset => dataset.data);
  const maxValue = Math.max(0, ...allDataPoints); // Ensure max is at least 0

  // Update the y-axis scale
  chart.options.scales.y = {
    ...chart.options.scales.y, // Preserve other y-axis settings
    min: 0, // Minimum is always 0
    max: 1.05 * maxValue, // Maximum based on data
  };
}

function getLeagueBadgePath(league) {
  return "./premier-league.png"
}

function getClubLogoURL(club_id, size) {
  const logoURL = `https://cdn.sofifa.net/teams/${club_id}/${size}.png`;
  return logoURL;
}


function getLeagueClubIds(country, league) {
  const filteredClubs = selectedYearData.filter(
    (row) => row.league_name === league && row.league_country === country
  );
  const uniqueClubIds = new Set(filteredClubs.map((row) => row.club_team_id));
  return uniqueClubIds;
}

function selectByNation(nationality) {
  return selectedYearData.filter((row) =>
    row.nationality_name === nationality);
}

function selectByLeagueCountry(league_country) {
  return selectedYearData.filter((row) =>
    row.league_country === league_country);
}

function selectByLeague(league_country, league_name) {
  return selectedYearData.filter((row) =>
    row.league_name === league_name && row.league_country === league_country);
}

function selectByClub(league_country, league_name, club_name) {
  return selectedYearData.filter((row) =>
    row.club_name === club_name && row.league_name === league_name && row.league_country === league_country);
}

function getUniqueLeaguesByCountry(league_country) {
  const filteredData = selectedYearData.filter((row) =>
    row.league_country === league_country);
  return new Set(filteredData.map(row => row.league_name));
}

function getClubNameById(club_team_id) {
  const club = selectedYearData.find((row) => row.club_team_id === club_team_id);
  return club ? club.club_name : null;
}

function getPlayersPhotoURL(player_id, fifa_version, size) {
  const idString = player_id.toString()
  return `https://cdn.sofifa.net/players/${idString.slice(0, 3)}/${idString.slice(3)}/${fifa_version}_${size}.png`;
}

function getColor(value) {
  const colors = [
    "darkred", "#de3700", "darkorange", "orange", "#ffe600", "#e1ff00", "#92e000", "#2aa10f", "darkgreen", "#295e11"
  ];
  if (value < 25) return colors[0];
  if (value < 50) return colors[1];
  if (value < 57) return colors[2];
  if (value < 65) return colors[3];
  if (value < 70) return colors[4];
  if (value < 75) return colors[5];
  if (value < 80) return colors[6];
  if (value < 87) return colors[7];
  if (value < 93) return colors[8];
  return colors[9]
}

function getFontColor(value) {
  const colors = [
    "darkred", "#de3700", "darkorange", "orange", "#ffe600", "#e1ff00", "#92e000", "#2aa10f", "darkgreen", "#295e11"
  ];
  if (value == 0) return "black";
  if (value < 25) return "white";
  if (value < 50) return "white";
  if (value < 57) return "black";
  if (value < 65) return "black";
  if (value < 70) return "black";
  if (value < 75) return "black";
  if (value < 80) return "white";
  if (value < 87) return "white";
  if (value < 93) return "white";
  return "white"
}

function updatePlayerStats(playerData) {
  const stats = [
    'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy', 'attacking_short_passing', 'attacking_volleys',
    'skill_dribbling', 'skill_curve', 'skill_fk_accuracy', 'skill_long_passing', 'skill_ball_control',
    'movement_acceleration', 'movement_sprint_speed', 'movement_agility', 'movement_reactions', 'movement_balance',
    'power_shot_power', 'power_jumping', 'power_stamina', 'power_strength', 'power_long_shots',
    'mentality_aggression', 'mentality_interceptions', 'mentality_positioning', 'mentality_vision', 'mentality_penalties', 'mentality_composure',
    'defending_marking_awareness', 'defending_standing_tackle', 'defending_sliding_tackle'
  ];

  stats.forEach(stat => {
    const element = document.getElementById(stat);
    const value = playerData[stat] || 0;
    const color = getColor(value);

    // Update the value and apply background color
    element.innerText = value;
    element.style.color = getFontColor(value)
    element.style.backgroundColor = color;
  });
}

function getPlayerValues(player_id) {
  let value_eur_per_year = [null, null, null, null, null];
  const playerData = allVersionsData.filter(d => d.player_id === player_id);
  playerData.forEach((record) => {
    const yearIndex = record.fifa_version - 20;
    value_eur_per_year[yearIndex] = record.value_eur;
  });
  return value_eur_per_year;
}

function getPlayerWages(player_id) {
  let wage_eur_per_year = [null, null, null, null, null];
  const playerData = allVersionsData.filter(d => d.player_id === player_id);
  playerData.forEach((record) => {
    const yearIndex = record.fifa_version - 20;
    wage_eur_per_year[yearIndex] = record.wage_eur;
  });
  return wage_eur_per_year;
}

const searchInput = document.getElementById("search_input");
const dropdownList = document.getElementById("dropdown_list");
const searchButton = document.getElementById("search_button");

// Function to update the dropdown with matching terms
function updateDropdown(filteredTerms) {
  dropdownList.innerHTML = ""; // Clear previous list
  filteredTerms.forEach(term => {
    const item = document.createElement("div");
    item.classList.add("dropdown-item");
    item.textContent = term;
    item.onclick = () => {
      searchInput.value = term; // Set the clicked term in the input
      dropdownList.style.display = "none"; // Hide dropdown after selection
    };
    dropdownList.appendChild(item);
  });
  dropdownList.style.display = filteredTerms.length > 0 ? "block" : "none"; // Show/hide dropdown based on results
}

// Event listener for search input
searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const filteredTerms = [...selectedYearDisplayedSet].filter(term => term.toLowerCase().includes(searchTerm));
  updateDropdown(filteredTerms); // Update the dropdown with filtered terms
});

// Event listener for search button (click action)
searchButton.addEventListener("click", function () {
  const selectedTerm = searchInput.value;
  if (selectedYearDisplayedSet.has(selectedTerm)) {
    selectedCountry = selectedTerm;
    selectedCountryHasMultipleLeagues = getUniqueLeaguesByCountry(selectedTerm).size > 1;
    mapClick(selectedTerm);
  }
});

function drawHeatmap(data) {
  const positions = [
    ["ls", "st", "rs"],
    ["lw", "lf", "cf", "rf", "rw"],
    ["lam", "cam", "ram"],
    ["lm", "lcm", "cm", "rcm", "rm"],
    ["lwb", "ldm", "cdm", "rdm", "rwb"],
    ["lb", "lcb", "cb", "rcb", "rb"],
    ["gk"]
  ];

  // Select the heatmap div and get its dimensions
  const heatmapDiv = d3.select("#heatmap");
  heatmapDiv.selectAll("svg").remove();
  const width = heatmapDiv.node().clientWidth;
  const height = heatmapDiv.node().clientHeight;

  const svg = heatmapDiv.append("svg")
    .attr("width", width)
    .attr("height", height);

  const rowHeight = height / positions.length; // Divide the div into 7 rows

  // Create a tooltip element
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("font-size", "12px")
    .style("z-index", "9999");

  positions.forEach((level, rowIndex) => {
    const levelWidth = width / level.length; // Divide row into columns based on positions

    level.forEach((position, colIndex) => {
      const value = data[position]; // Get the value for this position from the datapoint

      const rect = svg.append("rect")
        .attr("x", colIndex * levelWidth)
        .attr("y", rowIndex * rowHeight)
        .attr("width", levelWidth)
        .attr("height", rowHeight)
        .attr("fill", getColor(value));

      // Optional: Add labels to each rectangle
      svg.append("text")
        .attr("x", (colIndex + 0.5) * levelWidth)
        .attr("y", (rowIndex + 0.5) * rowHeight)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", getFontColor(value))
        .text(position.toUpperCase())
        .style("pointer-events", "none");

      // Hover event to show tooltip
      rect.on("mouseover", function (event) {
        tooltip.style("visibility", "visible")
          .text(`${position.toUpperCase()}: ${value}`)
          .style("top", (event.pageY + 10) + "px")  // Add slight offset for better positioning
          .style("left", (event.pageX + 10) + "px");
      });

      // Mouse out event to hide tooltip
      rect.on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });
    });
  });
}
