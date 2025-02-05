<button on:click={handleExport}>Charaktere exportieren</button>
<input type="file" accept=".csv" on:change={handleImport}/>



<script>
    import { characters, addCharacter } from "./CharacterStore";
    import { exportToCSV, importFromCSV } from "./csvHandler";

    function handleExport() {
        exportToCSV($characters);
    }

    function handleImport(event) {
        const file = event.target.files[0];
        if(file) {
            importFromCSV(file, importedCharacters => {
                importedCharacters.forEach(character => {
                    addCharacter(character.name, character.baseReaction, character.baseIntuition, character.baseInitiativePasses, character.edge, character.woundModifiers);
                });
            });
        }
    }
</script>