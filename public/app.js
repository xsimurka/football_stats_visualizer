var data;
var leagueCountries;
var nationalities;
var currentSet;
var geoLayer;
var table;
const fifaVersion = 24;

var selectedCountry;
var countryHasMultipleLeagues;
var selectedLeague;
var selectedTeam;

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
    "#b0e0e6", // Powder Blue
    "#ffa07a", // Light Salmon
    "#5f9ea0", // Cadet Blue
    "#ffff00", // Yellow
    "#f08080", // Light Coral
    "#ffd700", // Gold
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener("DOMContentLoaded", function () {
  const backButtonLeagues = document.getElementById("back_button_leagues");
  const backButtonTeams = document.getElementById("back_button_teams");

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
  table.setData(data);
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
    table.setData(data);
  });
});

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
    leagueCountries = new Set(data.map(row => row["league_country"]));
    nationalities = new Set(data.map(row => row["nationality_name"]));
    currentSet = leagueCountries;
    displayMap();
    displayTable();
  });

function setCountryStylesAndInteractivity(geoLayer) {
  geoLayer.eachLayer(function (layer) {
    const countryName = layer.feature.properties.ADMIN;

    if (currentSet.has(countryName)) {
      layer.setStyle({
        fillColor: getRandomColor(),
        fillOpacity: 0.7,
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
    center: [20, 0],
    zoom: 2,
    scrollWheelZoom: true,
  });

  fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
    .then((response) => response.json())
    .then((data) => {
      geoLayer = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
          const countryName = feature.properties.ADMIN;

          layer.on("click", function () {
            if (layer.options.interactive) {
              selectedCountry = countryName;
              countryHasMultipleLeagues = getUniqueLeaguesByCountry(countryName).size > 1;
              mapClick(countryName);
            }
          });

          const centroid = turf.centroid(feature).geometry.coordinates.reverse();
          const initialZoom = map.getZoom();
          const initialFontSize = Math.max(8, Math.min(initialZoom * 2, 24));
          const label = L.divIcon({
            className: "country-label",
            html: `<div style="white-space: nowrap; font-size: ${initialFontSize}px;">${countryName}</div>`
          });

          const marker = L.marker(centroid, { icon: label, interactive: false });
          marker.addTo(map)
          countryLabels.push({ marker, layer });
        },
      });

      geoLayer.addTo(map);

      setCountryStylesAndInteractivity(geoLayer);
    });

  const countryLabels = [];

  map.on("zoom", function () {
    const zoom = map.getZoom();

    countryLabels.forEach(({ marker, layer }) => {
      const countryName = layer.feature.properties.ADMIN;
      const fontSize = Math.max(8, Math.min(zoom * 2, 24));
      const opacity = zoom > 2 ? 1 : 0;

      marker.setIcon(
        L.divIcon({
          className: "country-label",
          html: `<div style="white-space: nowrap; font-size: ${fontSize}px;">${countryName}</div>`,
        })
      );
      marker.setOpacity(opacity);
    });
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

  const teams = getLeagueClubIds(countryName, leagueName, 24);

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
    data: data,
    layout: "fitColumns",
    columns: [
      {
        title: "Name",
        field: "name",
        headerSort: true,
        resizable: false,
        formatter: "plaintext",  // Ensures proper text formatting
      },
      {
        title: "Rating",
        field: "overall",
        headerSort: true,
        resizable: false,
        width: 90,
        sorter: "number",  // Sorting by numbers for better handling of ratings
        headerColor: "#2a9d8f",  // Adding custom header color
        cssClass: "rating-column" // Adding a custom class for CSS styling
      },
      {
        title: "Age",
        field: "age",
        headerSort: true,
        resizable: false,
        width: 80,
        sorter: "number"
      },
      {
        title: "Positions",
        field: "player_positions",
        headerSort: false,
        resizable: false,
      },
      {
        title: "Strong foot",
        field: "preferred_foot",
        headerSort: false,
        resizable: false,
      },
      {
        title: "Value (€)",
        field: "value_eur",
        headerSort: true,
        resizable: false,
        width: 120
      },
      {
        title: "Wage (€)",
        field: "wage_eur",
        headerSort: true,
        resizable: false,
        width: 120
      },
      {
        title: "Release clause (€)",
        field: "release_clause_eur",
        headerSort: true,
        resizable: false,
        width: 180,
      },
      {
        title: "Nationality",
        field: "nationality_name",
        headerSort: false,
        resizable: false,
      },
    ],
    selectable: false,

    rowFormatter: function (row) {
      // Adding custom background color for every other row
      if (row.getPosition() % 2 === 0) {
        row.getElement().style.backgroundColor = "#f0f4f8";
      } else {
        row.getElement().style.backgroundColor = "#ffffff";
      }
    },
  });

  table.on("rowClick", function (e, row) {
    const selectedPlayer = row.getData();

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

    const photoURL = getPlayersPhotoURL(selectedPlayer.player_id, selectedPlayer.fifa_version, 120);
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
    createTimelineChart(ctx, timeData, "Player's Wage")
    
    ctx = document.createElement("canvas");
    container = document.getElementById("value_timeline");
    container.innerHTML = ""; // Clear previous chart
    container.appendChild(ctx);
    timeData = getPlayerValues(selectedPlayer.player_id);
    createTimelineChart(ctx, timeData, "Player's Value")
  });

  table.on("rowMouseOver", function (e, row) {
    console.log(`Mouse over row: ${row.getData().name}`);
  });
}

function createTimelineChart(ctx, data, label) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024'], // FIFA versions as years
      datasets: [{
        data: data,
        borderColor: '#2a9d8f', // Customize the line color
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
            callback: function(value) {
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
}

function getLeagueBadgePath(league) {
  return "./premier-league.png"
}

function getClubLogoURL(club_id, size) {
  const logoURL = `https://cdn.sofifa.net/teams/${club_id}/${size}.png`;
  return logoURL;
}


function getLeagueClubIds(country, league, year) {
  const filteredClubs = data.filter(
    (row) => row.league_name === league && row.fifa_version === year && row.league_country === country
  );
  const uniqueClubIds = new Set(filteredClubs.map((row) => row.club_team_id));
  return uniqueClubIds;
}

function selectByNation(nationality) {
  return data.filter((row) =>
    row.fifa_version === fifaVersion && row.nationality_name === nationality);
}

function selectByLeagueCountry(league_country) {
  return data.filter((row) =>
    row.fifa_version === fifaVersion && row.league_country === league_country);
}

function selectByLeague(league_country, league_name) {
  return data.filter((row) =>
    row.fifa_version === fifaVersion && row.league_name === league_name && row.league_country === league_country);
}

function selectByClub(league_country, league_name, club_name) {
  return data.filter((row) =>
    row.fifa_version === fifaVersion && row.club_name === club_name && row.league_name === league_name && row.league_country === league_country);
}

function getUniqueLeaguesByCountry(league_country) {
  const filteredData = data.filter((row) =>
    row.league_country === league_country);
  return new Set(filteredData.map(row => row.league_name));
}

function getClubNameById(club_team_id) {
  const club = data.find((row) => row.club_team_id === club_team_id);
  return club ? club.club_name : null; // Return the club name or null if not found
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
