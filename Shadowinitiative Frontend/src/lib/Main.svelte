<div class="Title">
    <h1>Shadowinitiative</h1>
    <h2>Ein Initiativetracker für Shadowrun 4</h2>
</div>

<hr>
<GMTable />
<hr>

<div class="Characters">
    <div class="addCharacterForm">
        <h3>Charakter hinzufügen</h3>
        <AddCharacterForm />
    </div>
    <div class="ListAvailableCharacters">
        <h3>Verfügbare Charaktere</h3>
        <ListAvailableCharacters />
    </div>
</div>

<div class="ExportImport">
    <hr>
    <CSVComponent />
</div>



<script>
    import AddCharacterForm from "./AddCharacterForm.svelte";
    import ListAvailableCharacters from "./ListAvailableCharacters.svelte";
    import CSVComponent from "./CSVComponent.svelte";
    import GMTable from "./GMTable.svelte";
</script>



<style lang="css">
    .Title {
        text-align: center;
    }
    .Title h1 {
        font-size: 3em;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
    }
    .Title h2 {
        font-size: 1.5em;
        padding: 0 0 0 0;
        margin: 0 0 0 0;
    }

    .Characters {
        display: flex;
        justify-content: space-around;
    }
</style>