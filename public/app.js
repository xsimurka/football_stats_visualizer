var data;
var selectedVersionData;
var leagueCountries;
var nationalities;
var currentSet;
var geoLayer;
var table;
var valueTimeline;
var wageTimeline;

var referencePlayer;
var comparedPlayer = null;

var selectedCountry;
var countryHasMultipleLeagues;
var selectedLeague;
var selectedTeam;

const multipleLeaguesCountries = new Set(["United Kingdom", "Italy", "Germany", "France", "Spain"])


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
    data = csvData;
    selectedVersionData = data.filter(row => row.fifa_version === 24)
    leagueCountries = new Set(selectedVersionData.map(row => row["league_country"]));
    nationalities = new Set(selectedVersionData.map(row => row["nationality_name"]));
    currentSet = leagueCountries;
    showOnlySelectedLabels(currentSet)
    displayMap();
    displayTable();
  });

document.getElementById("fifa_version_select").addEventListener("change", (event) => {
  const selectedVersion = event.target.value;

  selectedVersionData = data.filter(row => row.fifa_version == selectedVersion)
  leagueCountries = new Set(selectedVersionData.map(row => row.league_country));
  nationalities = new Set(selectedVersionData.map(row => row.nationality_name));

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  currentSet = selectedMode === "league" ? leagueCountries : nationalities;

  setCountryStylesAndInteractivity(geoLayer);
  table.setData(selectedVersionData);
  playerDisplayStats(table.getRows()[0].getData());
  showOnlySelectedLabels(currentSet)
});

document.addEventListener("DOMContentLoaded", function () {
  const backButtonLeagues = document.getElementById("back_button_leagues");
  const backButtonTeams = document.getElementById("back_button_teams");
  document.getElementById("fifa_version_select").value = "24";
  document.querySelector('input[name="mode"][value="league"]').checked = true;

  backButtonLeagues.addEventListener("click", backToMap);
  backButtonTeams.addEventListener("click", function () {
    if (countryHasMultipleLeagues) {
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
  table.setData(selectedVersionData);
}

function backToLeagues() {
  document.getElementById("team_div").classList.remove("show");
  document.getElementById("league_div").classList.add("show");
  table.setData(selectByLeagueCountry(selectedCountry));
}


document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    currentSet = event.target.value === "league" ? leagueCountries : nationalities;
    setCountryStylesAndInteractivity(geoLayer);
    table.setData(selectedVersionData);
    showOnlySelectedLabels(currentSet)
  });
});

function getRandomColor() {
  const colors = [
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
  return colors[Math.floor(Math.random() * colors.length)];
}

function setCountryStylesAndInteractivity(geoLayer) {
  geoLayer.eachLayer((layer) => {
    const countryName = layer.feature.properties.ADMIN;

    if (currentSet.has(countryName)) {
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
  const map = L.map("map_div", {
    center: [37, 0],
    zoom: 2,
    scrollWheelZoom: true,
    zoomControl: false,
    minZoom: 2,
    attributionControl: false,
  });

  L.control.zoom({
    position: "bottomleft",
  }).addTo(map);

  fetch("./countries.geojson")
    .then((response) => response.json())
    .then((countryData) => {
      geoLayer = L.geoJSON(countryData, {
        onEachFeature: function (feature, layer) {
          const countryName = feature.properties.ADMIN;
          const countryId = countryName.replace(/\s+/g, "-").toLowerCase(); // Generate a unique ID

          layer.on("click", function () {
            if (layer.options.interactive) {
              selectedCountry = countryName;
              countryHasMultipleLeagues = multipleLeaguesCountries.has(countryName);
              mapClick(countryName);
            }
          });

          const centroid = turf.centroid(feature).geometry.coordinates.reverse();
          const initialZoom = map.getZoom();
          const initialFontSize = Math.max(8, Math.min(initialZoom * 2, 24));

          const label = L.divIcon({
            className: "country-label",
            html: `<div id="label-${countryId}" style="white-space: nowrap; font-size: ${initialFontSize}px;">${countryName}</div>`,
          });

          const marker = L.marker(centroid, { icon: label, interactive: false });
          marker.addTo(map);
        },
      });

      geoLayer.addTo(map);

      setCountryStylesAndInteractivity(geoLayer);
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
    showOnlySelectedLabels(currentSet);
  });
}

function showOnlySelectedLabels(selectedCountries) {
  // Normalize country names for ID matching
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
    table.setData(filteredData);
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
    table.setData(filteredData);
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
    teamBadge.style.backgroundImage = `url(${logo})`;
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
      selectedTeam = clubName;
      console.log(`Clicked on team: ${clubName}`);
      const filteredData = selectByClub(countryName, leagueName, clubName);
      table.setData(filteredData);
    };

    teamContainer.appendChild(teamBadge);

    const filteredData = selectByLeague(countryName, leagueName);
    table.setData(filteredData);
  });
}


function displayTable() {
  table = new Tabulator("#table_div", {
    data: selectedVersionData,
    layout: "fitData",
    columns: [
      {
        title: "Name",
        field: "name",
        headerSort: true,
        resizable: false,
        formatter: "plaintext",  // Ensures proper text formatting
        minWidth: 150
      },
      {
        title: "Rating",
        field: "overall",
        headerSort: true,
        resizable: false,
        sorter: "number",  // Sorting by numbers for better handling of ratings
        cssClass: "rating-column" // Adding a custom class for CSS styling
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

    rowFormatter: function (row) {
      if (row.getPosition() % 2 === 0) {
        row.getElement().style.backgroundColor = "#f0f4f8";
      } else {
        row.getElement().style.backgroundColor = "#ffffff";
      }
    },
  });

  table.on("tableBuilt", function () {
    playerDisplayStats(table.getRows()[0].getData());
  });


  table.on("rowClick", (e, row) => {
    console.log(table.getRows())
    let selectedPlayer = row.getData();
    playerDisplayStats(selectedPlayer)
  });


  table.on("rowMouseOver", function (e, row) {
    let inspectedPlayer = row.getData();
    if (inspectedPlayer.player_id == comparedPlayer) { // inspecting the same player as last time (no change)
      return;
    }

    comparedPlayer = inspectedPlayer.player_id;
    let timeData;
    removeLine(wageTimeline, 1);
    console.log(referencePlayer, comparedPlayer)
    if (referencePlayer != comparedPlayer) {
      timeData = getPlayerWages(inspectedPlayer.player_id);
      addLine(wageTimeline, timeData);
    }
    removeLine(valueTimeline, 1);
    if (referencePlayer != comparedPlayer) {
      timeData = getPlayerValues(inspectedPlayer.player_id);
      addLine(valueTimeline, timeData);
    }
  });

  return table;
}

function playerDisplayStats(selectedPlayer) {
  referencePlayer = selectedPlayer.player_id;
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
  playerPhotoDiv.style.backgroundImage = `url('${photoURL}')`;

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
  container.appendChild(ctx);
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: "lightgrey", // Transparent background
          borderColor: "black", // Chart line color (if any)
          pointBackgroundColor: function (context) {
            const value = context.raw; // Get the value of the point
            if (value <= 20) return "red"; // Red for 0-20
            if (value <= 40) return "orange"; // Orange for 20-40
            if (value <= 60) return "yellow"; // Yellow for 40-60
            if (value <= 80) return "lightgreen"; // Light Green for 60-80
            return "darkgreen"; // Dark Green for 80-100
          },
          pointBorderColor: "#fff", // White border for the points
          pointRadius: 6, // Bigger dots
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
              size: 12,
              weight: "bold", // Make labels bold
            },
            color: function (context) {
              const value = dataPoints[context.index]; // Get the value of the point
              if (value <= 20) return "red"; // Red for 0-20
              if (value <= 40) return "orange"; // Orange for 20-40
              if (value <= 60) return "yellow"; // Yellow for 40-60
              if (value <= 80) return "lightgreen"; // Light Green for 60-80
              return "darkgreen"; // Dark Green for 80-100
            },
            callback: function (label, index) {
              return `${label}`;
            },
          },
        },
      },
    },
  });

  updatePlayerStats(selectedPlayer);

  ctx = document.createElement("canvas");
  container = document.getElementById("wage_timeline");
  container.innerHTML = ""; // Clear previous chart
  container.appendChild(ctx);
  let timeData = getPlayerWages(selectedPlayer.player_id);
  wageTimeline = createTimelineChart(ctx, timeData, "Player's Wage")

  ctx = document.createElement("canvas");
  container = document.getElementById("value_timeline");
  container.innerHTML = ""; // Clear previous chart
  container.appendChild(ctx);
  timeData = getPlayerValues(selectedPlayer.player_id);
  valueTimeline = createTimelineChart(ctx, timeData, "Player's Value")
}


function createTimelineChart(ctx, data, label) {
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
  updateYScale(chart)
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
  const filteredClubs = selectedVersionData.filter(
    (row) => row.league_name === league && row.league_country === country
  );
  const uniqueClubIds = new Set(filteredClubs.map((row) => row.club_team_id));
  return uniqueClubIds;
}

function selectByNation(nationality) {
  return selectedVersionData.filter((row) =>
    row.nationality_name === nationality);
}

function selectByLeagueCountry(league_country) {
  return selectedVersionData.filter((row) =>
    row.league_country === league_country);
}

function selectByLeague(league_country, league_name) {
  return selectedVersionData.filter((row) =>
    row.league_name === league_name && row.league_country === league_country);
}

function selectByClub(league_country, league_name, club_name) {
  return selectedVersionData.filter((row) =>
    row.club_name === club_name && row.league_name === league_name && row.league_country === league_country);
}

function getUniqueLeaguesByCountry(league_country) {
  const filteredData = selectedVersionData.filter((row) =>
    row.league_country === league_country);
  return new Set(filteredData.map(row => row.league_name));
}

function getClubNameById(club_team_id) {
  const club = selectedVersionData.find((row) => row.club_team_id === club_team_id);
  return club ? club.club_name : null;
}

function getPlayersPhotoURL(player_id, fifa_version, size) {
  const idString = player_id.toString()
  return `https://cdn.sofifa.net/players/${idString.slice(0, 3)}/${idString.slice(3)}/${fifa_version}_${size}.png`;
}

function updatePlayerStats(playerData) {
  document.getElementById('attacking_crossing').innerText = playerData.attacking_crossing || '0';
  document.getElementById('attacking_finishing').innerText = playerData.attacking_finishing || '0';
  document.getElementById('attacking_heading_accuracy').innerText = playerData.attacking_heading_accuracy || '0';
  document.getElementById('attacking_short_passing').innerText = playerData.attacking_short_passing || '0';
  document.getElementById('attacking_volleys').innerText = playerData.attacking_volleys || '0';

  document.getElementById('skill_dribbling').innerText = playerData.skill_dribbling || '0';
  document.getElementById('skill_curve').innerText = playerData.skill_curve || '0';
  document.getElementById('skill_fk_accuracy').innerText = playerData.skill_fk_accuracy || '0';
  document.getElementById('skill_long_passing').innerText = playerData.skill_long_passing || '0';
  document.getElementById('skill_ball_control').innerText = playerData.skill_ball_control || '0';

  document.getElementById('movement_acceleration').innerText = playerData.movement_acceleration || '0';
  document.getElementById('movement_sprint_speed').innerText = playerData.movement_sprint_speed || '0';
  document.getElementById('movement_agility').innerText = playerData.movement_agility || '0';
  document.getElementById('movement_reactions').innerText = playerData.movement_reactions || '0';
  document.getElementById('movement_balance').innerText = playerData.movement_balance || '0';

  document.getElementById('power_shot_power').innerText = playerData.power_shot_power || '0';
  document.getElementById('power_jumping').innerText = playerData.power_jumping || '0';
  document.getElementById('power_stamina').innerText = playerData.power_stamina || '0';
  document.getElementById('power_strength').innerText = playerData.power_strength || '0';
  document.getElementById('power_long_shots').innerText = playerData.power_long_shots || '0';

  document.getElementById('mentality_aggression').innerText = playerData.mentality_aggression || '0';
  document.getElementById('mentality_interceptions').innerText = playerData.mentality_interceptions || '0';
  document.getElementById('mentality_positioning').innerText = playerData.mentality_positioning || '0';
  document.getElementById('mentality_vision').innerText = playerData.mentality_vision || '0';
  document.getElementById('mentality_penalties').innerText = playerData.mentality_penalties || '0';
  document.getElementById('mentality_composure').innerText = playerData.mentality_composure || '0';

  document.getElementById('defending_marking_awareness').innerText = playerData.defending_marking_awareness || '0';
  document.getElementById('defending_standing_tackle').innerText = playerData.defending_standing_tackle || '0';
  document.getElementById('defending_sliding_tackle').innerText = playerData.defending_sliding_tackle || '0';
}

function getPlayerValues(player_id) {
  let value_eur_per_year = [null, null, null, null, null];
  const playerData = data.filter(d => d.player_id === player_id);
  playerData.forEach((record) => {
    const yearIndex = record.fifa_version - 20;
    value_eur_per_year[yearIndex] = record.value_eur;
  });
  return value_eur_per_year;
}

function getPlayerWages(player_id) {
  let wage_eur_per_year = [null, null, null, null, null];
  const playerData = data.filter(d => d.player_id === player_id);
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
  const filteredTerms = [...currentSet].filter(term => term.toLowerCase().includes(searchTerm));
  updateDropdown(filteredTerms); // Update the dropdown with filtered terms
});

// Event listener for search button (click action)
searchButton.addEventListener("click", function () {
  const selectedTerm = searchInput.value;
  if (currentSet.has(selectedTerm)) {
    selectedCountry = selectedTerm;
    countryHasMultipleLeagues = getUniqueLeaguesByCountry(selectedTerm).size > 1;
    mapClick(selectedTerm);
  }
});