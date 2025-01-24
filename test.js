// Beispiel-Daten: Nachbarn für jedes Land
const neighbors = {
    Albania: ["Montenegro", "Kosovo", "North Macedonia", "Greece"],
    Montenegro: ["Bosnia and Herzegovina", "Serbia", "Albania"],
    Kosovo: ["Serbia", "Montenegro", "North Macedonia"],
    NorthMacedonia: ["Albania", "Kosovo", "Serbia", "Greece"],
    Greece: ["Albania", "North Macedonia", "Turkey", "Bulgaria"],
    Serbia: ["Montenegro", "Kosovo", "Romania", "Hungary", "Bosnia and Herzegovina"],
    France: ["Spain", "Germany", "Belgium", "Italy"],
    Germany: ["Poland", "France", "Czech Republic", "Belgium", "Netherlands"],
    Poland: ["Germany", "Czech Republic", "Ukraine"],
    Ukraine: ["Poland", "Romania", "Slovakia", "Hungary"],
    // Weitere Länder und ihre Nachbarn ...
};

// Funktion, um eine Verbindung zu prüfen
function isConnected(from, to, guessedCountries) {
    if (guessedCountries.length < 2) {
        return false; // Mindestens 2 Zwischenländer nötig
    }

    // Start mit dem 'from'-Land
    let currentCountry = from;

    for (let i = 0; i < guessedCountries.length; i++) {
        const nextCountry = guessedCountries[i];

        // Prüfen, ob das nächste Land ein Nachbar des aktuellen ist
        if (!neighbors[currentCountry] || !neighbors[currentCountry].includes(nextCountry)) {
            return false; // Keine Verbindung zwischen den Ländern
        }

        // Weiter zum nächsten Land
        currentCountry = nextCountry;
    }

    // Prüfen, ob das letzte Land mit 'to' verbunden ist
    return neighbors[currentCountry] && neighbors[currentCountry].includes(to);
}

// Beispiel: Aufruf der Funktion
const from = "Albania";
const to = "Germany";
const guessedCountries = ["NorthMacedonia", "Serbia", "Czech Republic"];

if (isConnected(from, to, guessedCountries)) {
    console.log("Die Länder sind verbunden!");
} else {
    console.log("Die Verbindung ist nicht möglich.");
}
