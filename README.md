# Country Connection Game 🌍 - Guess The Way
The Country Connection Game is an interactive guessing game where players must connect two given countries by identifying neighboring countries that form a valid path between them. The goal is to find a continuous chain of neighboring countries without missing any links.

## Rules
You are given two countries, e.g., Ukraine and Spain.
Guess the countries that lie between them and form a path of neighbors.
Example: Ukraine → Poland → Germany → France → Spain.
Each guessed country must directly border the previous one.
Misspelled countries or countries that are not neighbors will not be accepted.
The order of guesses does not matter, but all required countries must be included.

## Features
- A complete map of European countries and their neighbors.
- Automatic validation of guesses to ensure correctness.
- Flexible input: the order of guessed countries does not matter, as long as the path is complete. - This took a while to make and test
- Educational and fun: improve your geography knowledge while solving puzzles.

## Tech Stack
- Frontend:
Vue.js: A progressive JavaScript framework used to build the interactive user interface.
MapKit: Used for rendering maps and displaying geographical data.
HTML & CSS: For structuring and styling the frontend.
- Backend:
PHP: The server-side language used for handling game logic and API requests.
Data:
GeoJSON: Used for storing and managing geographical data, such as country borders

## Demo
[https://alex.polan.sk/guess-the-way/](https://alex.polan.sk/guess-the-way/)

## Screenshots
![Screenshot - 1](screenshots/1.png)
![Screenshot - 2](screenshots/2.png)
![Screenshot - 3](screenshots/3.png)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# Ideas
- Ability to show countries outline
