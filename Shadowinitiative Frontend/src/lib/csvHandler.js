import { Character } from "./Character";

export function exportToCSV(characters) {
    const csvHeaders = ["name", "reaction", "intuition", "initiativePasses", "edge", "woundModifiers"];
    const csvRows = characters.map(char => [
        char.getName(),
        char.getBaseReaction(),
        char.getBaseIntuition(),
        char.getBaseInitiativePasses(),
        char.getEdge(),
        char.getWoundModifiers()
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += csvHeaders.join(",") + "\n";
    csvRows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shadowinitiative_characters.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function importFromCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        const rows = csvData.split('\n').slice(1); // Skip header row
        const characters = rows.map(row => {
            const [name, reaction, intuition, initiativePasses, edge, woundModifiers] = row.split(',');
            return new Character(name, Number(reaction), Number(intuition), Number(initiativePasses), Number(edge), Number(woundModifiers));
        }).filter(char => char.name); // Filter out empty rows
        callback(characters);
    };
    reader.readAsText(file);
}