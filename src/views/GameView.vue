<template>
  <header class="app-header">
    <h1>Guess the Way!</h1>
    <p class="app-description">
      In this game, you are given two countries and must find a path of
      neighboring countries connecting them. You can guess any number of
      countries in between, but the order doesn't matter. The goal is to ensure
      all guessed countries are correctly connected in the network of
      neighboring countries.
    </p>
  </header>
  <div id="map" style="width: 100%; height: 100vh"></div>
  <!-- <div id="country-pair">
    From: {{ countryPair.from }} To: {{ countryPair.to }}
  </div>-->
  <div id="floating-input">
    <h1>Go from {{ countryPair.from }} to {{ countryPair.to }}</h1>
    <!-- <div class="outline-checkbox">
      <label>
        Show Outlines:
        <input v-model="showOutline" type="checkbox" />
      </label>
    </div>-->
    <form @submit.prevent="updateCountrie">
      <input
        type="text"
        v-model="countriee"
        placeholder="Enter country name and press Enter"
      />
    </form>
    <!--<strong>Read the Readme.md for instructions on how to play.</strong>-->
  </div>
  <button id="reload-button" @click="reloadGame">&#x21bb;</button>
  <!--<form action=""></form>
  <form @submit.prevent="updateCountrie">
    <input type="text" v-model="countriee" placeholder="Enter Countrie..." />
    <button type="submit">Submit</button>
  </form>-->
</template>

<script>
import {
  getRandomCountryPair,
  isConnected,
  formatCountryName,
} from "../getCountries.js";
import { shallowRef } from "vue";
//import axios from "axios";
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
          fetch("https://alex.polan.sk/people-map/verify.php")
            .then((res) => res.text())
            .then(done);
        },
        language: "en",
      });

      const region = new window.mapkit.CoordinateRegion(
        // new window.mapkit.Coordinate(47.687284, 24.847534),
        new window.mapkit.Coordinate(49.187719, 19.95125),

        //new window.mapkit.CoordinateSpan(50.0, 100.0)
        new window.mapkit.CoordinateSpan(40.0, 80.0)
      );

      const map = new window.mapkit.Map("map", {
        mapType: window.mapkit.Map.MapTypes.Satellite,
        center: new window.mapkit.Coordinate(47.687284, 24.84753),
        region: region,
        ///showsUserLocation: true,
        //showsUserLocationControl: true,
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
      /*  try {
        const response = await this.$axios.get("pins.php");

        if (response.data.error) {
          console.error(response.data.error);
          this.$router.push("/");
          return;
        }

        this.pins = response.data;
        if (this.pins.length > 0) {
          this.pins.forEach((pin) => {
            const coordinate = new window.mapkit.Coordinate(
              Number(pin.latitude),
              Number(pin.longitude)
            );
            const annotation = new window.mapkit.MarkerAnnotation(coordinate, {
              title: pin.title,
              // Maybe later :)
              /*  color: "#160808",
              glyphText: "🏠",
            });
            map.addAnnotation(annotation);
          });
        }
      } catch (error) {
        console.error("Error fetching bases:", error);
        return;
      }*/

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

      /*var mapLegend = document.querySelector(".map-legend");

      function addLegend() {
        let el, textNode;
        MAP_COLORS.forEach(function (mColor) {
          el = document.createElement("div");
          textNode = document.createTextNode(mColor.range);
          el.appendChild(textNode);
          el.style.background = mColor.color;
          mapLegend.appendChild(el);
        });
      }

      addLegend();*/

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
      /* window.mapkit.importGeoJSON(
        "https://alex.polan.sk/people-map/countries.php",
        geoJSONParserDelegate
      );*/

      /*map.addEventListener("select", (event) => {
        if (!event.shiftKey && !this.isPlacingPin) {
          const country = event.overlay.data.name;
          console.log(country);

          if (event.overlay) {
            if (confirm("You selected " + country)) {
              console.log("You selected an overlay. " + country);

              if (
                !localStorage.getItem("voted") ||
                localStorage.getItem("voted") !== "true"
              ) {
                // Submit data to backend using axios
                this.$axios
                  .post(
                    "data.php",
                    this.$qs.stringify({
                      country: country,
                    })
                  )
                  .then((response) => {
                    console.log(response.data);
                    if (response.data.status === "success") {
                      localStorage.setItem("voted", "true");

                      axios
                        .get("https://alex.polan.sk/people-map/countries.php")
                        .then((response) => {
                          map.overlays.forEach((overlay) =>
                            map.removeOverlay(overlay)
                          );

                          window.mapkit.importGeoJSON(
                            response.data,
                            geoJSONParserDelegate
                          );
                        });
                    } else {
                      alert("Error: " + response.data.message);
                    }
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
              } else {
                alert("You have already selected a country.");
              }
            }
          }
        }
      });*/
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

      /*.then(
        (result) => {
          if (result) {
            alert("Correct!");
            this.countryPair = getRandomCountryPair();
            this.guessedCountries = [];
          } else {
            alert("Incorrect!");
          }
        }
      );*/
    },
    reloadGame() {
      this.countryPair = getRandomCountryPair();
      this.guessedCountries = [];
      this.countriee = "";
      // Add any additional logic to reset the game state

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
        itemForPolygon: (overlay) =>{
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

        itemForFeature: (overlay, geoJSON) =>{
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
  z-index: 1000; /* Ensure the vignette is above other elements */
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
  z-index: 1001; /* Ensure the header is above other elements */
  position: absolute;
  background-color: transparent; /* Completely transparent background */
  text-align: center;
  justify-content: center;
  width: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0)
  ); /* Gradient shadow from top */
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
</style>
