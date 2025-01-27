/* Data */
var allVersionsData;
var selectedYearData;

/* Selection items */
var selectedYearLeagueCountries;
var selectedYearNationalities;
var selectedYearDisplayed;
var referencePlayerId;
var comparedPlayerId = null;
var selectedCountry;
var selectedCountryHasMultipleLeagues;
var selectedLeague;
var selectedClub;

/* Map */
var map;
var mapGeoLayer;

const MAP_COLORS = [
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

/* Table */
var selectedPlayersTable;
var firstLoad = true;

/* Plots */
var playerValueTimeLine;
var playerWageTimeLine;
var playerRadarChart;

const DEFAULT_FIFA_VERSION = 24;
const MULTIPLE_LEAGUE_COUNTRIES = new Set(["United Kingdom", "Italy", "Germany", "France", "Spain"])

// Attributes to compare
const PLAYER_STATS = [
  'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy', 'attacking_short_passing', 'attacking_volleys',
  'skill_dribbling', 'skill_curve', 'skill_fk_accuracy', 'skill_long_passing', 'skill_ball_control',
  'movement_acceleration', 'movement_sprint_speed', 'movement_agility', 'movement_reactions', 'movement_balance',
  'power_shot_power', 'power_jumping', 'power_stamina', 'power_strength', 'power_long_shots',
  'mentality_aggression', 'mentality_interceptions', 'mentality_positioning', 'mentality_vision', 'mentality_penalties', 'mentality_composure',
  'defending_marking_awareness', 'defending_standing_tackle', 'defending_sliding_tackle'
];

const PLAYER_ATTRIBUTES = ["defending", "shooting", "passing", "dribbling", "pace", "physic"];
const PLAYER_LABELS = ["Defending", "Shooting", "Passing", "Dribbling", "Pace", "Physic"];
const GK_ATTRIBUTES = ["goalkeeping_diving", "goalkeeping_handling", "goalkeeping_kicking", "goalkeeping_positioning", "goalkeeping_reflexes", "goalkeeping_speed"]
const GK_LABELS = ["Diving", "Handling", "Kicking", "Positioning", "Reflexes", "Speed"];

/* HTML components getters */
const backButtonLeagues = document.getElementById("back_button_leagues");
const backButtonTeams = document.getElementById("back_button_teams");
const fifaVersionSelectMenu = document.getElementById("fifa_version_select");
const searchInput = document.getElementById("search_input");
const searchDropdownList = document.getElementById("dropdown_list");
const searchButton = document.getElementById("search_button");
const mapDiv = document.getElementById("map_div");
const leagueDiv = document.getElementById("league_div");
const teamDiv = document.getElementById("team_div");


document.addEventListener("DOMContentLoaded", function () {
  fifaVersionSelectMenu.value = DEFAULT_FIFA_VERSION;
  document.querySelector('input[name="mode"][value="league"]').checked = true;
  searchInput.value = "";

  backButtonLeagues.addEventListener("click", backToMap);
  backButtonTeams.addEventListener("click", () => {
    if (selectedCountryHasMultipleLeagues) {
      backToLeagues();
    } else {
      backToMap();
    }
  });
});

d3.csv("./data/players_all_preprocessed.csv", (d) => {
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
    nationality_id: +d.nationality_id,
    nationality_name: d.nationality_name,
    preferred_foot: d.preferred_foot,
    weak_foot: +d.weak_foot,
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
  .then((csvData) => {
    allVersionsData = csvData;
    selectedYearData = allVersionsData.filter(row => row.fifa_version === DEFAULT_FIFA_VERSION)
    selectedYearLeagueCountries = new Set(selectedYearData.map(row => row.league_country));
    selectedYearNationalities = new Set(selectedYearData.map(row => row.nationality_name));
    selectedYearDisplayed = selectedYearLeagueCountries;  // default mode is League
    displayMap();
    setupPlayersTable();
  });

fifaVersionSelectMenu.addEventListener("change", (event) => {
  firstLoad = true;
  const selectedVersion = event.target.value;

  selectedYearData = allVersionsData.filter(row => row.fifa_version == selectedVersion)
  selectedYearLeagueCountries = new Set(selectedYearData.map(row => row.league_country));
  selectedYearNationalities = new Set(selectedYearData.map(row => row.nationality_name));

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  selectedYearDisplayed = selectedMode === "league" ? selectedYearLeagueCountries : selectedYearNationalities;

  setCountryStylesAndInteractivity(mapGeoLayer);
  selectedPlayersTable.setData(selectedYearData);
  displaySelectedPlayer(selectedPlayersTable.getRows()[0].getData()); // Display the first player when version changed
  showSelectedMapLabels(selectedYearDisplayed)
  hideAttributeComparizons();
});

function backToMap() {
  mapDiv.classList.remove("hide");
  teamDiv.classList.remove("show");
  leagueDiv.classList.remove("show");
  selectedPlayersTable.setData(selectedYearData);
}

function backToLeagues() {
  teamDiv.classList.remove("show");
  leagueDiv.classList.add("show");
  selectedPlayersTable.setData(selectPlayersByCountry(selectedCountry));
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedYearDisplayed = event.target.value === "league" ? selectedYearLeagueCountries : selectedYearNationalities;
    setCountryStylesAndInteractivity(mapGeoLayer);
    selectedPlayersTable.setData(selectedYearData);
    showSelectedMapLabels(selectedYearDisplayed)
    hideAttributeComparizons();
  });
});

function hideAttributeComparizons() {
  PLAYER_STATS.forEach(attr => {
    const diffElement = document.getElementById(`${attr}_diff`);
    diffElement.classList.remove('show');
  });
}

function getRandomCountryColor() {
  return MAP_COLORS[Math.floor(Math.random() * MAP_COLORS.length)];
}

function setCountryStylesAndInteractivity() {
  mapGeoLayer.eachLayer((layer) => {
    const countryName = layer.feature.properties.ADMIN;

    if (selectedYearDisplayed.has(countryName)) {
      layer.setStyle({
        fillColor: getRandomCountryColor(),
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

searchInput.addEventListener("blur", () => {
  searchDropdownList.style.display = "none";
});

// Hide dropdown if clicking outside of the search input or dropdown
document.addEventListener("click", function (event) {
  var searchContainer = document.querySelector(".search-container");
  if (!searchContainer.contains(event.target)) {
    searchDropdownList.style.display = "none";
  }
});

// Function to update the dropdown with matching terms
function updateDropdown(filteredTerms) {
  searchDropdownList.innerHTML = ""; // Clear previous list
  filteredTerms.forEach(term => {
    const item = document.createElement("div");
    item.classList.add("dropdown-item");
    item.textContent = term;
    item.onclick = () => {
      searchInput.value = term; // Set the clicked term in the input
      searchDropdownList.style.display = "none"; // Hide dropdown after selection
    };
    searchDropdownList.appendChild(item);
  });
  searchDropdownList.style.display = filteredTerms.length > 0 ? "block" : "none"; // Show/hide dropdown based on results
}

// Event listener for search input
searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();

  // If search term is empty, don't show anything
  if (searchTerm === "") {
    updateDropdown([]); // Pass an empty array to hide the dropdown
  } else {
    const filteredTerms = [...selectedYearDisplayed].filter(term => term.toLowerCase().startsWith(searchTerm));
    updateDropdown(filteredTerms); // Update the dropdown with filtered terms
  }
});

// Event listener for search button (click action)
searchButton.addEventListener("click", function () {
  const selectedTerm = searchInput.value;
  searchInput.value = "";
  if (selectedYearDisplayed.has(selectedTerm)) {
    selectedCountry = selectedTerm;
    selectedCountryHasMultipleLeagues = getUniqueLeaguesByCountry(selectedTerm).size > 1;
    searchDropdownList.classList.remove("show")
    PLAYER_STATS.forEach(attr => {
      const diffElement = document.getElementById(`${attr}_diff`);
      diffElement.classList.remove('show');
    });
    mapClick(selectedTerm);
  }
});

function displayMap() {
  const southWest = L.latLng(-60, -180); // Bottom-left corner
  const northEast = L.latLng(85, 180);  // Top-right corner
  const bounds = L.latLngBounds(southWest, northEast);

  map = L.map("map_div", {
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

  fetch("./data/countries.geojson")
    .then((response) => response.json())
    .then((countryData) => {
      mapGeoLayer = L.geoJSON(countryData, {
        onEachFeature: function (feature, layer) {
          const countryName = feature.properties.ADMIN;
          const countryId = countryName.replace(/\s+/g, "-").toLowerCase(); // Generate a unique ID

          layer.on("click", () => {
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
    showSelectedMapLabels(selectedYearDisplayed);
  });

  map.on("dragend", function () {
    const currentCenter = map.getCenter();

    if (!bounds.contains(currentCenter)) {
      const clampedLat = Math.max(
        southWest.lat,
        Math.min(northEast.lat, currentCenter.lat)
      );
      const clampedLng = Math.max(
        southWest.lng,
        Math.min(northEast.lng, currentCenter.lng)
      );
      map.setView([clampedLat, clampedLng]);
    }
  });
}

function showSelectedMapLabels(selectedCountries) {
  const zoom = map.getZoom();
  const fontSize = Math.max(8, Math.min(zoom * 2, 24));

  const normalizedSelectedCountries = new Set(
    Array.from(selectedCountries).map((country) =>
      country.replace(/\s+/g, "-").toLowerCase()
    )
  );

  document.querySelectorAll(".country-label > div").forEach((labelDiv) => {
    labelDiv.style.fontSize = `${fontSize}px`;
    const labelId = labelDiv.id.replace("label-", "");

    // Show only the labels in the selectedCountries set
    if (normalizedSelectedCountries.has(labelId) && zoom > 2) {
      labelDiv.style.opacity = 1; // Make visible
    } else {
      labelDiv.style.opacity = 0; // Hide
    }
  });
}

function mapClick(countryName) {
  const radioValue = document.querySelector('input[name="mode"]:checked').value;
  if (radioValue === "nationality") {
    const filteredData = selectPlayersByNation(countryName);
    selectedPlayersTable.setData(filteredData);
  } else { // leagues
    mapDiv.classList.add("hide");
    let leagues = getUniqueLeaguesByCountry(countryName);
    if (leagues.size > 1) {
      showLeagues(countryName, leagues);
    } else {
      showTeams(countryName, leagues.values().next().value); // has exactly one
    }
  }
}

function showLeagues(countryName, leagues) {
  leagueDiv.classList.add("show");

  const leagueContainer = document.getElementById('league_grid');
  const countryNameSpan = document.getElementById("country_name");
  countryNameSpan.textContent = countryName;
  leagueContainer.innerHTML = '';

  leagues.forEach(league => {
    const leagueWrapper = document.createElement('div');
    leagueWrapper.className = 'badge-wrapper';

    const leagueBadge = document.createElement('div');
    leagueBadge.className = 'badge';
    const badge = getLeagueBadgeURL(league);
    leagueBadge.style.backgroundImage = `url(${badge})`;
    leagueBadge.onclick = function () {
      selectedLeague = league;
      showTeams(countryName, league);
    };

    const leagueName = document.createElement('div');
    leagueName.className = 'badge-label';
    leagueName.textContent = league;

    leagueWrapper.appendChild(leagueBadge);
    leagueWrapper.appendChild(leagueName);
    leagueContainer.appendChild(leagueWrapper);

    const filteredData = selectPlayersByCountry(countryName);
    selectedPlayersTable.setData(filteredData);
  });
}

function showTeams(countryName, leagueName) {
  leagueDiv.classList.remove("show");
  teamDiv.classList.add("show");

  const teamContainer = document.getElementById('team_grid');
  teamContainer.innerHTML = ''; // Clear previous content
  const leagueNameSpan = document.getElementById("league_name");
  leagueNameSpan.textContent = leagueName;

  const teams = getLeagueClubIds(countryName, leagueName);
  teams.forEach(team => {
    const wrapper = document.createElement('div');
    wrapper.className = 'badge-wrapper'; // Reuse league-wrapper class

    // Badge element
    const badge = document.createElement('div');
    badge.className = 'badge'; // Reuse badge class
    const logo = getClubBadgeURL(team, 120);

    const img = new Image();
    img.onload = () => {
      badge.style.backgroundImage = `url(${logo})`;
    };
    img.onerror = () => {
      badge.style.backgroundImage = `url(./data/images/undefined-logo.png)`;
    };
    img.src = logo;

    const name = document.createElement('div');
    name.className = 'badge-label';
    name.textContent = getClubNameById(team);

    badge.onclick = () => {
      selectedClub = name.textContent;
      const filteredData = selectPlayersByClub(countryName, leagueName, selectedClub);
      selectedPlayersTable.setData(filteredData);
    };

    wrapper.appendChild(badge);
    wrapper.appendChild(name);
    teamContainer.appendChild(wrapper);

    const filteredData = selectPlayersByLeague(countryName, leagueName);
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
    if (selectedRow && selectedRow.getData().player_id === row.getData().player_id) {
      row.getElement().style.backgroundColor = 'rgba(42, 157, 143, 0.4)'; // Last clicked row color
    }
  }

  table.on("dataProcessed", function () {
    if (firstLoad) { // Only on first load and version change not to override the selected player all the time
      let firstRow = table.getRows()[0];
      selectedRow = firstRow;
      displaySelectedPlayer(firstRow.getData());
      firstLoad = false;
    }
    table.getRows().forEach(r => {
      rowFormatter(r);
    });
  });

  table.on("rowClick", (e, row) => {
    let selectedPlayer = row.getData();
    selectedRow = row; // Store the clicked row for future reference
    // Restore the row color for all rows before applying the new color to the selected row
    table.getRows().forEach(r => {
      rowFormatter(r); // This will use the default row colors from rowFormatter
    });


    displaySelectedPlayer(selectedPlayer);
  });

  table.on("rowMouseOver", (e, row) => {
    table.getRows().forEach(r => {
      rowFormatter(r); // This will use the default row colors from rowFormatter
    });
    if (row.getData().player_id != selectedRow.getData().player_id) {
      row.getElement().style.backgroundColor = 'rgba(236, 14, 14, 0.4)'; // Light red for hovered row
    }

    let inspectedPlayerData = row.getData();
    displayInspectedPlayer(inspectedPlayerData);
  });

  selectedPlayersTable = table;
}

function displayInspectedPlayer(inspectedPlayerData) {
  if (inspectedPlayerData.player_id == comparedPlayerId) { // inspecting the same player as last time (no change)
    return;
  }
  comparedPlayerId = inspectedPlayerData.player_id;
  let referencePlayerData = selectedYearData.find(d => d.player_id === referencePlayerId);

  PLAYER_STATS.forEach(stat => {
    const inspectedValue = inspectedPlayerData[stat];
    const referenceValue = referencePlayerData[stat];

    const difference = inspectedValue - referenceValue;

    // Update the *_diff span
    const diffElement = document.getElementById(`${stat}_diff`);
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

  });

  let { dataPoints } = getPlayerStats(inspectedPlayerData)

  /* Update all 3 charts */
  radarRemoveComparedPlayerDataset(playerRadarChart, 1);
  // Goalies do not have player attributes therefore it make no sense to compare them with player
  if (referencePlayerId != comparedPlayerId && !(referencePlayerData.player_positions != 'GK' && inspectedPlayerData.player_positions == 'GK')) {
    radarAddComparedPlayerDataset(playerRadarChart, dataPoints, inspectedPlayerData.name)
  }

  let timeData;
  lineRemoveComparedPlayerDataset(playerWageTimeLine, 1);
  if (referencePlayerId != comparedPlayerId) {
    timeData = getPlayerWages(inspectedPlayerData.player_id);
    lineAddComparedPlayerDataset(playerWageTimeLine, timeData, inspectedPlayerData.name);
  }

  lineRemoveComparedPlayerDataset(playerValueTimeLine, 1);
  if (referencePlayerId != comparedPlayerId) {
    timeData = getPlayerMarketValues(inspectedPlayerData.player_id);
    lineAddComparedPlayerDataset(playerValueTimeLine, timeData, inspectedPlayerData.name);
  }
}

function displaySelectedPlayer(selectedPlayer) {
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

  // Handles the case when the player nas no photo in the database
  let i = new Image();
  i.onload = () => {
    playerPhotoDiv.style.backgroundImage = `url('${photoURL}')`;
  };
  i.onerror = () => {
    playerPhotoDiv.style.backgroundImage = `url('https://cdn.sofifa.net/player_0.svg')`;
  };
  i.src = photoURL;

  const { labels, dataPoints } = getPlayerStats(selectedPlayer);
  console.log(labels, dataPoints)

  let radarCanvas = document.createElement("canvas");
  let container = document.getElementById("radarchart");
  radarCanvas.style.margin = '5px';
  container.innerHTML = "";
  playerRadarChart = createRadarChart(radarCanvas, labels, dataPoints, selectedPlayer.name);
  container.appendChild(radarCanvas);

  let timeLineCanvas = document.createElement("canvas");
  timeLineCanvas.style.margin = '20px';
  container = document.getElementById("wage_timeline");
  container.innerHTML = "";
  let timeData = getPlayerWages(selectedPlayer.player_id);
  playerWageTimeLine = createTimelineChart(timeLineCanvas, timeData, "Monthly Wage", selectedPlayer.name)
  container.appendChild(timeLineCanvas);

  timeLineCanvas = document.createElement("canvas");
  timeLineCanvas.style.margin = '20px';
  container = document.getElementById("value_timeline");
  container.innerHTML = "";
  timeData = getPlayerMarketValues(selectedPlayer.player_id);
  playerValueTimeLine = createTimelineChart(timeLineCanvas, timeData, "Market Value", selectedPlayer.name)
  container.appendChild(timeLineCanvas);

  updatePlayerStats(selectedPlayer);
  drawHeatmap(selectedPlayer)
}

function getPlayerStats(player) {
  if (player.player_positions === "GK") {
    return {
      labels: GK_LABELS,
      dataPoints: GK_ATTRIBUTES.map(attr => +player[attr]),
    };
  } else {
    return {
      labels: PLAYER_LABELS,
      dataPoints: PLAYER_ATTRIBUTES.map(attr => +player[attr]),
    };
  }
}

function updatePlayerStats(playerData) {
  PLAYER_STATS.forEach(stat => {
    const element = document.getElementById(stat);
    const value = playerData[stat];
    const color = getColor(value);

    // Update the value and apply background color
    element.innerText = value;
    element.style.color = getFontColor(value)
    element.style.backgroundColor = color;
  });
}

/* Getters */
function getLeagueBadgeURL(league) {
  switch (league) {
    case "Premier League":
      return "./data/images/premier-league-logo.png"
    case "Championship":
      return "./data/images/the-championship-logo.png"
    case "Premiership":
      return "./data/images/scotish-premiership-logo.jpg"
    case "League One":
      return "./data/images/league-one-logo.png"
    case "League Two":
      return "./data/images/league-two-logo.png"

    case "Serie A":
      return "./data/images/serie-a-logo.png"
    case "Serie B":
      return "./data/images/serie-b-logo.png"

    case "Ligue 1":
      return "./data/images/ligue1-logo.jpg"
    case "Ligue 2":
      return "./data/images/ligue2-logo.jpg"

    case "Bundesliga":
      return "./data/images/bundesliga-logo.png"
    case "2. Bundesliga":
      return "./data/images/bundesliga2-logo.png"
    case "3. Liga":
      return "./data/images/3liga-logo.png"

    case "La Liga":
      return "./data/images/la-liga-logo.jpg"
    case "La Liga 2":
      return "./data/images/la-liga2-logo.png"
  }
  return "./data/images/undefined-logo.png"
}

function getClubBadgeURL(club_id, size) {
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

function selectPlayersByNation(nationality) {
  return selectedYearData.filter((row) =>
    row.nationality_name === nationality);
}

function selectPlayersByCountry(league_country) {
  return selectedYearData.filter((row) =>
    row.league_country === league_country);
}

function selectPlayersByLeague(league_country, league_name) {
  return selectedYearData.filter((row) =>
    row.league_name === league_name && row.league_country === league_country);
}

function selectPlayersByClub(league_country, league_name, club_name) {
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
  const COLORS = [
    "darkred", "#de3700", "darkorange", "orange", "#ffe600", "#e1ff00", "#92e000", "#2aa10f", "darkgreen", "#295e11"
  ];
  if (value < 25) return COLORS[0];
  if (value < 50) return COLORS[1];
  if (value < 57) return COLORS[2];
  if (value < 65) return COLORS[3];
  if (value < 70) return COLORS[4];
  if (value < 75) return COLORS[5];
  if (value < 80) return COLORS[6];
  if (value < 87) return COLORS[7];
  if (value < 93) return COLORS[8];
  return COLORS[9]
}

function getFontColor(value) {
  if (value == 0) return "black";
  if (value < 25) return "white";
  if (value < 50) return "white";
  if (value < 57) return "black";
  if (value < 65) return "black";
  if (value < 70) return "black";
  if (value < 75) return "black";
  if (value < 80) return "black";
  if (value < 87) return "white";
  if (value < 93) return "white";
  return "white"
}

/* Charts */
function getPlayerMarketValues(player_id) {
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

function createRadarChart(canvas, labels, dataPoints, playerName) {
  return new Chart(canvas, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          data: dataPoints,
          label: playerName,
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderColor: "rgb(42, 157, 143)",
          pointBackgroundColor: function (context) {
            const value = context.raw;
            return getColor(value);
          },
          pointBorderColor: "rgba(0,0,0,0)",
          pointRadius: 4,
          borderWidth: 2,
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
            display: false,
          },
          angleLines: {
            color: "rgba(0, 0, 0, 0.3)",
            lineWidth: 1,
          },
          ticks: {
            display: false,
          },
          pointLabels: {
            font: {
              size: 10,
            },
            color: "black",
            callback: function (playerName, index) {
              return `${playerName}`;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context) {
              const datasetIndex = context[0].datasetIndex;
              const playerName = context[0].chart.data.datasets[datasetIndex].label;
              return playerName;
            },
            label: function (context) {
              return ` ${context.raw}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });
}

function radarAddComparedPlayerDataset(radarChart, newData, playerName) {
  radarChart.data.datasets.push({
    data: newData,
    label: playerName,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderColor: "rgb(236, 14, 14)",
    pointBackgroundColor: function (context) {
      const value = context.raw;
      return getColor(value);
    },
    pointRadius: 4,
    pointBorderColor: "rgba(0,0,0,0)",
    borderWidth: 2,
  });
  // Reduce the visibility of the reference player data
  radarChart.data.datasets[0].borderColor = "rgba(42, 157, 143, 0.5)"
  radarChart.data.datasets[0].pointRadius = 3,
    radarChart.update();
}

function radarRemoveComparedPlayerDataset(radarChart, index = 1) {
  if (radarChart.data.datasets.length > index) {
    radarChart.data.datasets.splice(index, 1);
    // Adjust the visibility of the reference player data
    radarChart.data.datasets[0].borderColor = "rgba(42, 157, 143, 1)"
    radarChart.data.datasets[0].pointRadius = 4,
      radarChart.update();
  }
}

function createTimelineChart(canvas, dataPoints, type, playerName) {
  const maxDataValue = Math.max(...dataPoints);
  const stepSize = Math.pow(10, Math.floor(Math.log10(maxDataValue)) - 3);
  const finalMax = calculateMaxYScale(maxDataValue);

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      datasets: [{
        data: dataPoints,
        borderColor: '#2a9d8f',
        backgroundColor: 'rgba(42, 157, 143, 0.4)',
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointBackgroundColor: '#2a9d8f',
        pointBorderWidth: 2,
        label: playerName,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            color: 'rgba(0, 0, 0, 1)',
          },
          border: {
            color: 'rgba(0, 0, 0, 1)',
            lineWidth: 1,
          },
          ticks: {
            color: 'rgba(0, 0, 0, 1)',
          },
        },
        y: {
          ticks: {
            callback: function (value) {
              return formatTicks(value, stepSize);
            },
            color: 'rgba(0, 0, 0, 1)',
          },
          title: {
            display: true,
            text: type,
            color: '#000',
          },
          border: {
            color: 'rgba(0, 0, 0, 1)',
            lineWidth: 1,
          },
          min: 0,
          max: finalMax,
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context) {
              const datasetIndex = context[0].datasetIndex;
              const playerName = context[0].chart.data.datasets[datasetIndex].label;
              return playerName;
            },
            label: function (context) {
              return ` ${context.raw}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    }
  });
}

function updateYScale(chart) {
  const allDataPoints = chart.data.datasets.flatMap(dataset => dataset.data);
  const maxValue = Math.max(0, ...allDataPoints);
  const finalMax = calculateMaxYScale(maxValue);
  chart.options.scales.y = {
    ...chart.options.scales.y,
    min: 0,
    max: finalMax,
  };
}

function calculateMaxYScale(maxValue) {
  const rawMax = maxValue * 1.05;
  const magnitude = Math.floor(Math.log10(rawMax));
  const stepSize = Math.pow(10, magnitude);
  const finalMax = Math.ceil(rawMax / stepSize) * stepSize;
  return finalMax;
}

function formatTicks(value, stepSize) {
  if (value === 0) return '0';
  const stepLabel = Math.floor(value / stepSize) * stepSize;
  if (stepLabel >= 1e6) {
    return (stepLabel / 1e6).toFixed(0) + 'M';
  } else if (stepLabel >= 1e3) {
    return (stepLabel / 1e3).toFixed(0) + 'K';
  }
  return stepLabel.toString();
}

function lineAddComparedPlayerDataset(lineChart, newData, playerName) {
  lineChart.data.datasets.push({
    label: playerName,
    data: newData,
    borderColor: 'rgb(236, 14, 14)',
    backgroundColor: 'rgb(236, 14, 14)',
    tension: 0.4,
    borderWidth: 1,
    pointRadius: 4,
    pointBackgroundColor: "rgb(236, 14, 14)",
    pointBorderWidth: 2
  });
  updateYScale(lineChart);
  lineChart.update();
}

function lineRemoveComparedPlayerDataset(lineChart, index) {
  lineChart.data.datasets.splice(index, 1);
  updateYScale(lineChart);
  lineChart.update();
}


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

  const heatmapDiv = d3.select("#heatmap");
  heatmapDiv.selectAll("svg").remove();
  const width = heatmapDiv.node().clientWidth;
  const height = heatmapDiv.node().clientHeight;

  const svg = heatmapDiv.append("svg")
    .attr("width", width)
    .attr("height", height);

  const rowHeight = height / positions.length;

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
    const levelWidth = width / level.length; // Divide row into columns based on number of positions

    level.forEach((position, colIndex) => {
      const value = data[position];

      const rect = svg.append("rect")
        .attr("x", colIndex * levelWidth)
        .attr("y", rowIndex * rowHeight)
        .attr("width", levelWidth)
        .attr("height", rowHeight)
        .attr("fill", getColor(value));

      // Labels for rectangles
      svg.append("text")
        .attr("x", (colIndex + 0.5) * levelWidth)
        .attr("y", (rowIndex + 0.5) * rowHeight)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "11px")
        .attr("fill", getFontColor(value))
        .text(position.toUpperCase())
        .style("pointer-events", "none");

      // Hover event to show tooltip
      rect.on("mouseover", function (event) {
        tooltip.style("visibility", "visible")
          .text(`${position.toUpperCase()}: ${value}`)
          .style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      });

      rect.on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });
    });
  });
}
