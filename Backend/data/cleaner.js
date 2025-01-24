const fs = require('fs');
const path = require('path');

// Read the GeoJSON file
const geojsonPath = path.join(__dirname, 'europe_split.geojson');
const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Function to clean properties
function cleanProperties(feature) {
  return {
    ...feature,
    properties: {
      NAME: feature.properties.NAME,
    },
  };
}

// Process each feature in the GeoJSON
const cleanedFeatures = geojsonData.features.map(cleanProperties);

// Create a new GeoJSON object
const newGeojsonData = {
  type: 'FeatureCollection',
  features: cleanedFeatures,
};

// Write the new GeoJSON to a file
const outputPath = path.join(__dirname, 'europe_cleaned.geojson');
fs.writeFileSync(outputPath, JSON.stringify(newGeojsonData, null, 2));

console.log('GeoJSON processing complete. Output written to europe_cleaned.geojson');