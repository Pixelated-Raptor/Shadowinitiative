<script>
    import { slCharacters, updateSLCharacter, removeSLCharacter } from "./SLStore";

    function updateInitiative(character, event) {
        const newInitiative = parseInt(event.target.value, 10);
        updateSLCharacter(character, { initiative: newInitiative });
    }

    function removeFromSLTable(character) {
        removeSLCharacter(character);
    }
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Ini</th>
            <th>Ini-D</th>
            <th>Reaktion</th>
            <th>Intuition</th>
            <th>Wound Modifiers</th>
            <th>Initiative</th>
            <th>Aktionen</th>
        </tr>
    </thead>
    <tbody>
        {#each $slCharacters.sort((a, b) => b.initiative - a.initiative) as char}
        <tr>
            <td>{char.getName()}</td>
            <td>{char.getInitiative()}</td>
            <td>{char.getModdedInitiativePasses()}</td>
            <td>{char.getModdedReaction()}</td>
            <td>{char.getModdedIntuition()}</td>
            <td>{char.getWoundModifiers()}</td>
            <td><input type="number" value={char.initiative} on:input={(event) => updateInitiative(char, event)} /></td>
            <td><button on:click={() => removeFromSLTable(char)}>Entfernen</button></td>
        </tr>
        {/each}
    </tbody>
</table>