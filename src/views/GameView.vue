<template>
  <header class="app-header">
    <h1>Guess the Way!</h1>
    <p class="app-description">
      In this game, you get two countries, and your job is to guess other
      countries that connect them by sharing borders. Each country you guess has
      to touch the previous one, like building a chain. If you guess a country
      that's not in the chain, it won't help you connect the two countries. if
      you misspell a country's name, it won't be accepted, so be careful with
      your spelling!
    </p>
  </header>
  <div id="map" style="width: 100%; height: 100vh"></div>
  <div id="floating-input">
    <h1>Connect {{ countryPair.from }} with {{ countryPair.to }}</h1>
    <form @submit.prevent="updateCountrie">
      <input
        type="text"
        v-model="countriee"
        placeholder="Enter country name and press Enter"
      />
    </form>
  </div>
  <button id="reload-button" @click="reloadGame">&#x21bb;</button>

  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Congratulations!</h2>
      <p>
        You have successfully connected {{ countryPair.from }} with
        {{ countryPair.to }}.
      </p>
      <button @click="reloadGame">Play Again</button>
    </div>
  </div>
</template>

<script>
import {
  getRandomCountryPair,
  isConnected,
  formatCountryName,
} from "../getCountries.js";
import { shallowRef } from "vue";
import JSConfetti from "js-confetti";

export default {
  name: "App",
  data() {
    return {
      countryPair: {},
      showOutline: false,
      countriee: "",
      countrie: "",
      map: shallowRef(null),
      MAP_COLORS: [],
      guessedCountries: [],
      showModal: false,
    };
  },
  async mounted() {
    await this.initMap();
    this.countryPair = getRandomCountryPair();
  },
  watch: {
    countrie(newVal, oldVal) {
      console.log(`countrie changed from ${oldVal} to ${newVal}`);
      this.submitCountrie(newVal);
    },
  },
  methods: {
    async initMap() {
      await window.mapkit.init({
        authorizationCallback: function (done) {
          fetch("https://alex.polan.sk/guess_the_way/verify.php")
            .then((res) => res.text())
            .then(done);
        },
        language: "en",
      });

      const region = new window.mapkit.CoordinateRegion(
        new window.mapkit.Coordinate(49.187719, 19.95125),
        new window.mapkit.CoordinateSpan(40.0, 80.0)
      );

      const map = new window.mapkit.Map("map", {
        mapType: window.mapkit.Map.MapTypes.Satellite,
        center: new window.mapkit.Coordinate(47.687284, 24.84753),
        region: region,
      });
      map.showsCompass = window.mapkit.FeatureVisibility.Visible;
      this.map = map;
      const MAP_COLORS = [
        {
          color: "#fcc5c0",
          range: "0",
          num: 1,
        },
        {
          color: "#fa9fb5",
          range: "1+",
          num: 10,
        },
        {
          color: "#008000",
          range: "10+",
          num: 20,
        },
        {
          color: "#dd3497",
          range: "20+",
          num: 30,
        },
        {
          color: "#ae017e",
          range: "30+",
          num: 50,
        },
        {
          color: "#7a0177",
          range: "50+",
          num: Infinity,
        },
      ];
      this.MAP_COLORS = MAP_COLORS;

      let geoJSONParserDelegate = {
        itemForPolygon: function (overlay) {
          let strokeOpacity = 0.8;
          let lineWidth = 1;
          if (!this.showOutline) {
            strokeOpacity = 0;
            lineWidth = 0;
          }

          overlay.style = new window.mapkit.Style({
            strokeColor: "#000",
            strokeOpacity: strokeOpacity,
            lineWidth: lineWidth,
            fillOpacity: 0.8,
            fillColor: "#CACACA",
          });
          map.addOverlay(overlay);
          return overlay;
        },

        itemForFeature: function (overlay, geoJSON) {
          const counter = geoJSON.properties.count;

          overlay.data = {
            name: geoJSON.properties.NAME,
            counter: geoJSON.properties.count,
          };

          // Find the right color for the population and the set the style.
          for (var i = 0; i < MAP_COLORS.length; ++i) {
            if (counter < MAP_COLORS[i].num) {
              let strokeOpacity = 0.8;
              let lineWidth = 1;
              if (!this.showOutline) {
                strokeOpacity = 0;
                lineWidth = 0;
              }

              overlay.style = new window.mapkit.Style({
                fillOpacity: 0.7,
                lineWidth: lineWidth,
                strokeOpacity: strokeOpacity,
                fillColor: MAP_COLORS[i].color,
              });
              break;
            }
          }
          return overlay;
        },

        geoJSONDidComplete: function (result, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidComplete");
          console.log(result);
          console.log(geoJSON);
        },
        geoJSONDidError: function (error, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidError");
          console.log(error);
          console.log(geoJSON);
        },
      };

      this.$axios.get("countries.php").then((response) => {
        let data = response.data;
        console.log(data);
        data.features.forEach((feature) => {
          if (
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.from) ||
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.to)
          ) {
            feature.properties.count = 15;
          }
        });
        window.mapkit.importGeoJSON(data, geoJSONParserDelegate);
      });
    },
    updateCountrie() {
      this.countrie = this.countriee;
      this.guessedCountries.push(this.countrie);
      this.countriee = "";
    },
    submitCountrie(countrie) {
      console.log("submitCountrie", countrie);
      this.$axios.get("countries.php").then((response) => {
        let data = response.data;
        console.log(data);
        data.features.forEach((feature) => {
          if (
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.from) ||
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.to)
          ) {
            feature.properties.count = 15;
          }

          this.guessedCountries.forEach((country) => {
            console.log(
              formatCountryName(country),
              formatCountryName(feature.properties.NAME)
            );
            if (
              formatCountryName(feature.properties.NAME) ===
              formatCountryName(country)
            ) {
              feature.properties.count = 1000;
            }
          });
        });
        this.map.overlays.forEach((overlay) => this.map.removeOverlay(overlay));

        window.mapkit.importGeoJSON(data, geoJSONParserDelegate);

        if (
          isConnected(
            this.countryPair.from.toLowerCase(),
            this.countryPair.to.toLowerCase(),
            this.guessedCountries
          )
        ) {
          const jsConfetti = new JSConfetti();
          jsConfetti.addConfetti();
          this.showModal = true;
          console.log("Correct!");
        } else {
          console.log("Incorrect!");
        }
      });

      let geoJSONParserDelegate = {
        itemForPolygon: (overlay) => {
          let strokeOpacity = 0.8;
          let lineWidth = 1;
          if (!this.showOutline) {
            strokeOpacity = 0;
            lineWidth = 0;
          }

          overlay.style = new window.mapkit.Style({
            strokeColor: "#000",
            strokeOpacity: strokeOpacity,
            lineWidth: lineWidth,
            fillOpacity: 0.8,
            fillColor: "#CACACA",
          });
          console.log("Map " + this.map);
          this.map.addOverlay(overlay);
          return overlay;
        },

        itemForFeature: (overlay, geoJSON) => {
          const counter = geoJSON.properties.count;

          overlay.data = {
            name: geoJSON.properties.NAME,
            counter: geoJSON.properties.count,
          };

          // Find the right color for the population and the set the style.
          for (var i = 0; i < this.MAP_COLORS.length; ++i) {
            if (counter < this.MAP_COLORS[i].num) {
              let strokeOpacity = 0.8;
              let lineWidth = 1;
              if (!this.showOutline) {
                strokeOpacity = 0;
                lineWidth = 0;
              }

              overlay.style = new window.mapkit.Style({
                fillOpacity: 0.7,
                lineWidth: lineWidth,
                strokeOpacity: strokeOpacity,
                fillColor: this.MAP_COLORS[i].color,
              });
              break;
            }
          }
          return overlay;
        },

        geoJSONDidComplete: function (result, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidComplete");
          console.log(result);
          console.log(geoJSON);
        },
        geoJSONDidError: function (error, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidError");
          console.log(error);
          console.log(geoJSON);
        },
      };
      this.guessedCountries = this.guessedCountries.map((country) =>
        country.toLowerCase()
      );
    },
    reloadGame() {
      this.countryPair = getRandomCountryPair();
      this.guessedCountries = [];
      this.countriee = "";
      this.showModal = false;

      this.$axios.get("countries.php").then((response) => {
        this.map.overlays.forEach((overlay) => this.map.removeOverlay(overlay));
        let data = response.data;
        data.features.forEach((feature) => {
          if (
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.from) ||
            formatCountryName(feature.properties.NAME) ===
              formatCountryName(this.countryPair.to)
          ) {
            feature.properties.count = 15;
          }
        });
        window.mapkit.importGeoJSON(data, geoJSONParserDelegate);
      });

      let geoJSONParserDelegate = {
        itemForPolygon: (overlay) => {
          let strokeOpacity = 0.8;
          let lineWidth = 1;
          if (!this.showOutline) {
            strokeOpacity = 0;
            lineWidth = 0;
          }

          overlay.style = new window.mapkit.Style({
            strokeColor: "#000",
            strokeOpacity: strokeOpacity,
            lineWidth: lineWidth,
            fillOpacity: 0.8,
            fillColor: "#CACACA",
          });
          this.map.addOverlay(overlay);
          return overlay;
        },

        itemForFeature: (overlay, geoJSON) => {
          const counter = geoJSON.properties.count;

          overlay.data = {
            name: geoJSON.properties.NAME,
            counter: geoJSON.properties.count,
          };

          // Find the right color for the population and the set the style.
          for (var i = 0; i < this.MAP_COLORS.length; ++i) {
            if (counter < this.MAP_COLORS[i].num) {
              let strokeOpacity = 0.8;
              let lineWidth = 1;
              if (!this.showOutline) {
                strokeOpacity = 0;
                lineWidth = 0;
              }

              overlay.style = new window.mapkit.Style({
                fillOpacity: 0.7,
                lineWidth: lineWidth,
                strokeOpacity: strokeOpacity,
                fillColor: this.MAP_COLORS[i].color,
              });
              break;
            }
          }
          return overlay;
        },

        geoJSONDidComplete: function (result, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidComplete");
          console.log(result);
          console.log(geoJSON);
        },
        geoJSONDidError: function (error, geoJSON) {
          console.log("GeoJSONDelegate.geoJSONDidError");
          console.log(error);
          console.log(geoJSON);
        },
      };
    },
    closeModal() {
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

#map::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1000;
}

#floating-input {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 10px;
  border-radius: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#floating-input h1 {
  margin: 0 0 10px;
  font-size: 32px;
}

.outline-checkbox {
  margin-bottom: 10px;
}

.outline-checkbox label {
  font-size: 18px;
}

#floating-input input[type="text"] {
  width: 100%;
  padding: 15px;
  font-size: 20px;
  border: 2px solid #ccc;
  border-radius: 12px;
  box-sizing: border-box;
}

.app-header {
  text-align: center;
  margin: 0;
  z-index: 1001;
  position: absolute;
  background-color: transparent;
  text-align: center;
  justify-content: center;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
  margin-bottom: 10px;
}

.app-header h1 {
  font-size: 2em;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  margin-bottom: 5px;
}

.app-description {
  font-size: 1.2em;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.25;
  padding: 0 20px;
  margin-top: 5px;
}

#reload-button {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  font-size: 50px;
  padding: 10px 25px;
  background-color: rgba(255, 255, 255, 0.6);
  color: black;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#reload-button:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
  text-align: center;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
