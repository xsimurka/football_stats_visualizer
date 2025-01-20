var data;
var leagueCountries;
var nationalities;
var currentSet;
let geoLayer;

let selectedCountry = "Country X";
let countryHasMultipleLeagues = false;

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

document.addEventListener("DOMContentLoaded", function() {
  const backButton = document.getElementById("back_button");
  const backButtonTeams = document.getElementById("back_button_teams");

  backButton.addEventListener("click", backToMap);
  backButtonTeams.addEventListener("click", function() {
    if (hasMultipleLeagues) {
      backToLeagues();
    } else {
      backToMap();
    }
  });

  function backToMap() {
    document.getElementById("league_grid").style.display = "none";
    document.getElementById("team_grid").style.display = "none";
    document.getElementById("map_div").style.display = "flex"; 
  }

  function backToLeagues() {
    document.getElementById("team_grid").style.display = "none";
    document.getElementById("league_grid").style.display = "flex";
  }
});

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    currentSet = event.target.value === "league" ? leagueCountries : nationalities;
    setCountryStylesAndInteractivity(geoLayer);
  });
});

function getUniqueLeaguesByCountry(leagueCountry) {
  const filteredData = data.filter(row => row.league_country === leagueCountry);
  return new Set(filteredData.map(row => row.league_name));
}

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
  let leagues = getUniqueLeaguesByCountry(countryName);
  if (leagues.size > 1) {
    showLeagues(countryName);
  }
  showTeams(countryName);
}

function showLeagues(countryName) {
  console.log(`Showing leagues for: ${countryName}`);

  document.getElementById('map_div').style.display = 'none';
  document.getElementById('league_grid').style.display = 'block';
  document.getElementById('back_button').style.display = 'block';

  const leagueContainer = document.getElementById('league_grid');
  leagueContainer.innerHTML = ''; 
  const leagues = getUniqueLeaguesByCountry(countryName);
  leagues.forEach(league => {
    const leagueBadge = document.createElement('div');
    leagueBadge.className = 'badge';
    leagueBadge.textContent = league;
    leagueBadge.onclick = function () {
      showTeams(league); 
    };
    leagueContainer.appendChild(leagueBadge);
  });
}

function showTeams(leagueName) {
  console.log(`Showing teams for: ${leagueName}`);
  

  document.getElementById('league_grid').style.display = 'none';
  document.getElementById('team_grid').style.display = 'block';
  document.getElementById('back_button_teams').style.display = 'block'; 

  const teamContainer = document.getElementById('team_grid');
  teamContainer.innerHTML = ''; 
  const teams = getTeamsByLeague(leagueName);
  teams.forEach(team => {
    const teamBadge = document.createElement('div');
    teamBadge.className = 'badge';
    teamBadge.textContent = team;
    teamContainer.appendChild(teamBadge);
  });
}


function displayTable() {
  const table = new Tabulator("#table_div", {
    data: data,
    layout: "fitDataFill",
    columns: [
      {
        title: "Name",
        field: "name",
        headerSort: true,
        resizable: false,
      },
      {
        title: "Value",
        field: "value_eur",
        headerSort: true,
        resizable: false,
      },
      {
        title: "Wage",
        field: "wage_eur",
        headerSort: true,
        resizable: false,
      },
    ],
    selectable: false,
  });

  table.on("rowClick", function (e, row) {
    console.log(`Row clicked: ${row.getData().name}`); 
  });

  table.on("rowMouseOver", function (e, row) {
    console.log(`Mouse over row: ${row.getData().name}`);
  });
}

function backToMap() {
  document.getElementById('map_div').style.display = 'block';
  document.getElementById('league_grid').style.display = 'none';
  document.getElementById('team_grid').style.display = 'none';
  document.getElementById('back_button').style.display = 'none';
}

function backToLeagues() {
  document.getElementById('team_grid').style.display = 'none';
  document.getElementById('league_grid').style.display = 'block';
  document.getElementById('back_button_teams').style.display = 'none';
  document.getElementById('back_button').style.display = 'block';
}
