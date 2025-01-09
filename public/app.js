var data;

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
    displayMap();
    displayTable();
  });

  function displayMap() {
    const map = L.map("map_div", {
      center: [20, 0], // Center on Africa for a global view
      zoom: 2, // Default zoom level for the whole world
      scrollWheelZoom: true,
    });
  
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((response) => response.json())
      .then((data) => {
        const geoLayer = L.geoJSON(data, {
          style: {
            color: "#333", // Border color
            weight: 1, // Border thickness
            fillColor: "lightgray", // Fill color for countries
            fillOpacity: 1, // Transparency
          },
          onEachFeature: function (feature, layer) {
            const countryName = feature.properties.ADMIN;
            const countryId = feature.properties.ISO_A3; // Use ISO-3 country code
  
            // Make the layer interactive for clicking
            layer.options.interactive = true;
  
            // Add click event
            layer.on("click", function () {
              mapClick(countryId, countryName);
            });
  
            // Calculate the centroid using turf.js
            const centroid = turf.centroid(feature).geometry.coordinates.reverse();
  
            // Add a label with the country's name (ensure all words are in one line)
            const initialZoom = map.getZoom();
            const initialFontSize = Math.max(8, Math.min(initialZoom * 2, 24)); // Scale font size
  
            const label = L.divIcon({
              className: "country-label", // Custom class for styling
              html: `<div style="white-space: nowrap; font-size: ${initialFontSize}px;">${countryName}</div>`, // Ensure single-line label
            });
  
            const marker = L.marker(centroid, { icon: label, interactive: false });
            marker.addTo(map);
  
            // Store the label marker for dynamic control
            countryLabels.push({ marker, layer });
          },
        });
  
        geoLayer.addTo(map); // Add the GeoJSON layer to the map
      });
  
    // Array to store label markers for dynamic control
    const countryLabels = [];
  
    // Adjust label visibility and size based on zoom level
    map.on("zoom", function () {
      const zoom = map.getZoom();
  
      countryLabels.forEach(({ marker, layer }) => {
        const countryName = layer.feature.properties.ADMIN;
        const fontSize = Math.max(8, Math.min(zoom * 2, 24)); // Scale font size between 8 and 24px based on zoom
        const opacity = zoom > 2 ? 1 : 0; // Hide labels for zoom <= 2
  
        marker.setIcon(
          L.divIcon({
            className: "country-label",
            html: `<div style="white-space: nowrap; font-size: ${fontSize}px;">${countryName}</div>`,
          })
        );
        marker.setOpacity(opacity);
      });
    });
  
    // Handle clicks
    function mapClick(countryId, countryName) {
      console.log(`Clicked on: ${countryName} (${countryId})`);
      alert(`You clicked on ${countryName} (${countryId})`);
    }
  }
  

function showLeagues(countryName) {
  console.log(`Showing leagues for: ${countryName}`);
}

function showTeams(leagueName) {
  console.log(`Showing reams for: ${leagueName}`);
}


function displayTable() {
  const table = new Tabulator("#table_div", {
    data: data, // Data for the table
    layout: "fitData", // Automatically adjust column width to fit content
    columns: [
      { title: "Name", field: "name", headerSort: true }, // Sortable column
      { title: "Value", field: "value_eur", headerSort: true }, // Sortable column
      { title: "Wage", field: "wage_eur", headerSort: true }, // Sortable column
    ],
    resizableColumns: false, // Disable column resizing
    selectable: false, // No row selection feature
  });

  // Row Click Event
  table.on("rowClick", function (e, row) {
    console.log(`Row clicked: ${row.getData().name}`); // Example functionality
  });

  // Row Mouse Over Event
  table.on("rowMouseOver", function (e, row) {
    console.log(`Mouse over row: ${row.getData().name}`); // Example functionality
  });
}

