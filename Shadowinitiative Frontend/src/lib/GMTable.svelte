<script>
    import { GMCharacters, updateGMCharacter, removeGMCharacter } from "./GMStore";

    function updateInitiative(character, event) {
        const newInitiative = parseInt(event.target.value, 10);
        updateGMCharacter(character, { initiative: newInitiative });
    }

    function removeFromGMTable(character) {
        removeGMCharacter(character);
    }
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Ini.</th>
            <th>Ini-D</th>
            <th>Rea.</th>
            <th>Int.</th>
            <th>Wound Modifiers</th>
            <th>Initiative</th>
            <th>Aktionen</th>
        </tr>
    </thead>
    <tbody>
        {#each $GMCharacters.sort((a, b) => b.initiative - a.initiative) as char}
        <tr>
            <td>{char.getName()}</td>
            <td>{char.getInitiative()}</td>
            <td>{char.getModdedInitiativePasses()}</td>
            <td>{char.getModdedReaction()}</td>
            <td>{char.getModdedIntuition()}</td>
            <td>{char.getWoundModifiers()}</td>
            <td><input type="number" value={char.initiative} on:input={(event) => updateInitiative(char, event)} /></td>
            <td><button on:click={() => removeFromGMTable(char)}>Entfernen</button></td>
        </tr>
        {/each}
    </tbody>
</table>