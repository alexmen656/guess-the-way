const countriePairs = [
  { from: "Albania", to: "Poland" },
  { from: "Albania", to: "Ukraine" },
  { from: "Albania", to: "Slovakia" },
  { from: "Albania", to: "Germany" },
  { from: "Albania", to: "France" },
  { from: "Poland", to: "Italy" },
  { from: "Poland", to: "Greece" },
  { from: "Poland", to: "Spain" },
  { from: "Ukraine", to: "France" },
  { from: "Ukraine", to: "Spain" },
  { from: "Slovakia", to: "Portugal" },
  { from: "Germany", to: "Portugal" },
  { from: "Germany", to: "Greece" },
  { from: "Germany", to: "Turkey" },
  { from: "France", to: "Turkey" },
  { from: "France", to: "Romania" },
  { from: "France", to: "Hungary" },
  { from: "Italy", to: "Poland" },
  { from: "Italy", to: "Ukraine" },
  { from: "Italy", to: "Slovakia" },
  { from: "Greece", to: "Czech Republic" },
  { from: "Greece", to: "Portugal" },
  { from: "Spain", to: "Ukraine" },
  { from: "Spain", to: "Romania" },
  { from: "Spain", to: "Turkey" },
  { from: "Portugal", to: "Hungary" },
  { from: "Portugal", to: "Czech Republic" },
  { from: "Turkey", to: "Poland" },
  { from: "Turkey", to: "Slovakia" },
];

const neighbors = {
    albania: ["montenegro", "serbia", "north macedonia", "greece"], // Sorry for kosovo, but geojson had no Kosovo
    andorra: ["france", "spain"],
    austria: ["germany", "czech republic", "slovakia", "hungary", "slovenia", "italy", "switzerland", "liechtenstein"],
    belarus: ["latvia", "lithuania", "poland", "russia", "ukraine"],
    belgium: ["france", "germany", "luxembourg", "netherlands"],
    bosnia_and_herzegovina: ["croatia", "montenegro", "serbia"],
    bulgaria: ["romania", "serbia", "north macedonia", "greece", "turkey"],
    croatia: ["slovenia", "hungary", "serbia", "bosnia and herzegovina", "montenegro"],
    czech_republic: ["germany", "poland", "austria", "slovakia"],
    denmark: ["germany"],
    estonia: ["latvia", "russia"],
    finland: ["norway", "sweden", "russia"],
    france: ["belgium", "luxembourg", "germany", "switzerland", "italy", "spain", "andorra", "monaco"],
    germany: ["denmark", "poland", "czech republic", "austria", "switzerland", "france", "luxembourg", "belgium", "netherlands"],
    greece: ["albania", "north macedonia", "bulgaria", "turkey"],
    hungary: ["austria", "slovakia", "ukraine", "romania", "serbia", "croatia", "slovenia"],
    iceland: [], // Keine Nachbarländer
    ireland: ["united kingdom"],
    italy: ["france", "switzerland", "austria", "slovenia", "san marino", "vatican city"],
    kosovo: ["montenegro", "serbia", "north macedonia", "albania"],
    latvia: ["estonia", "lithuania", "belarus", "russia"],
    liechtenstein: ["switzerland", "austria"],
    lithuania: ["latvia", "belarus", "poland", "russia"],
    luxembourg: ["belgium", "france", "germany"],
    malta: [], // Keine Nachbarländer
    moldova: ["romania", "ukraine"],
    monaco: ["france"],
    montenegro: ["bosnia and herzegovina", "serbia", "kosovo", "albania", "croatia"],
    netherlands: ["belgium", "germany"],
    north_macedonia: ["kosovo", "serbia", "bulgaria", "greece", "albania"],
    norway: ["sweden", "finland", "russia"],
    poland: ["germany", "czech republic", "slovakia", "ukraine", "belarus", "lithuania", "russia"],
    portugal: ["spain"],
    romania: ["ukraine", "moldova", "bulgaria", "serbia", "hungary"],
    russia: ["norway", "finland", "estonia", "latvia", "lithuania", "poland", "belarus", "ukraine", "georgia"],
    san_marino: ["italy"],
    serbia: ["hungary", "romania", "bulgaria", "north macedonia", "kosovo", "montenegro", "bosnia and herzegovina", "croatia"],
    slovakia: ["czech republic", "poland", "ukraine", "hungary", "austria"],
    slovenia: ["austria", "hungary", "croatia", "italy"],
    spain: ["portugal", "france", "andorra"],
    sweden: ["norway", "finland"],
    switzerland: ["france", "germany", "austria", "italy", "liechtenstein"],
    turkey: ["greece", "bulgaria"],
    ukraine: ["poland", "slovakia", "hungary", "romania", "moldova", "belarus", "russia"],
    united_kingdom: ["ireland"],
    vatican_city: ["italy"]
}

function getRandomCountryPair() {
  const randomIndex = Math.floor(Math.random() * countriePairs.length);
  return countriePairs[randomIndex];
}

function formatCountryName(name) {
    //console.log(name);
    name = String(name).toLowerCase();
    name = name.replaceAll(" ", "_");
    return name;
}

function isConnected(from, to, guessedCountries) {
    console.log("From:", from, "To:", to);
    console.log("Guessed Countries:", guessedCountries);

    // Wir kombinieren das from-Land, die guessedCountries und das to-Land in eine Liste
    const allCountries = [from, ...guessedCountries, to];

    // Wir erstellen eine Kopie der Nachbarschaftsdaten, damit wir den Weg durchlaufen können
    let graph = { ...neighbors };

    // Wir müssen alle Länder miteinander verbinden
    let visitedCountries = new Set();
    
    // Hilfsfunktion für Tiefensuche (DFS)
    function dfs(country) {
        if (visitedCountries.has(country)) return;
        visitedCountries.add(country);
        if (graph[country]) {
            for (let neighbor of graph[country]) {
                if (allCountries.includes(neighbor)) { // Nur Nachbarn, die in der Liste sind
                    dfs(neighbor);
                }
            }
        }
    }

    // Start bei `from` und tiefenrekursiv die Nachbarn besuchen
    dfs(from);

    // Wenn alle Länder besucht wurden, gibt es eine gültige Verbindung
    for (let country of allCountries) {
        if (!visitedCountries.has(country)) {
            return false; // Wenn auch nur ein Land nicht besucht wurde, ist die Verbindung ungültig
        }
    }

    return true;
}




export { getRandomCountryPair, isConnected, formatCountryName };
