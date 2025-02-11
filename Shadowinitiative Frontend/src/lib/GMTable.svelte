{#if $isCombatMode}
    <table>
        <thead>
            <tr>
                <th>Name und Stats</th>
                <th>Initiativeergebnis</th>
                <th>Sichtbar für PCs?</th>
                <th>INI-D: 1</th>
                <th>INI-D: 2</th>
                <th>INI-D: 3</th>
                <th>INI-D: 4</th>
            </tr>
        </thead>
        <tbody>
            {#each $combatCharacters.sort((a, b) => b.initiative - a.initiative) as char}
            <tr>
                <td>
                    {char.getName()} |
                    Reaktion: <button on:click={() => incrementStat(char, "moddedReaction")}>+</button> {char.getModdedReaction()} <button on:click={() => decrementStat(char, "moddedReaction")}>-</button> |
                    Intuition: <button on:click={() => incrementStat(char, "moddedIntuition")}>+</button> {char.getModdedIntuition()} <button on:click={() => decrementStat(char, "moddedIntuition")}>-</button> |
                    Ini-D: <button on:click={() => incrementStat(char, "moddedInitiativePasses")}>+</button> {char.getModdedInitiativePasses()} <button on:click={() => decrementStat(char, "moddedInitiativePasses")}>-</button> |
                    Wound Modifiers: <button on:click={() => incrementStat(char, "woundModifiers")}>+</button> {char.getWoundModifiers()} <button on:click={() => decrementStat(char, "woundModifiers")}>-</button>
                </td>
                <td>{char.initiative}</td>
                <td><input type="checkbox" checked={char.getVisibility()} on:change={() => toggleVisibility(char)} /></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={endCombat}>Kampf beenden</button>
    <button on:click={nextBattleround}>Nächste Kampfrunde</button>
{:else}
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Initiative</th>
                <th>Ini-Durchgänge</th>
                <th>Reaktion</th>
                <th>Intuition</th>
                <th>Wound Modifiers</th>
                <th>Initiativeergebnis</th>
                <th>Sichtbar in PC-Tabelle?</th>
                <th>Aktionen</th>
            </tr>
        </thead>
        <tbody>
            {#each $GMCharacters as char}
            <tr>
                <td>{char.getName()}</td>
                <td>{char.getInitiative()}</td>
                <td>{char.getModdedInitiativePasses()}</td>
                <td>{char.getModdedReaction()}</td>
                <td>{char.getModdedIntuition()}</td>
                <td>{char.getWoundModifiers()}</td>
                <td>
                    <input type="number" value={char.initiative} on:input={(event) => updateInitiative(char, event)}/>
                </td>
                <td><input type="checkbox" on:change={() => toggleVisibility(char)} checked={char.getVisibility()}/></td>
                <td><button on:click={() => removeFromGMTable(char)}>Aus Kampf entfernen</button></td>
            </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={startCombat}>Kampf starten</button>
{/if}


<script>
    import { GMCharacters, updateGMCharacter, removeGMCharacter } from "./GMStore";
    import { writable } from "svelte/store";

    let isCombatMode = writable(false);
    let combatCharacters = writable([]);

    function startCombat() {
        if($GMCharacters.length !== 0) {
            combatCharacters.set($GMCharacters);
            isCombatMode.set(true);
        }
    }

    function endCombat() {
        combatCharacters.set([]);
        GMCharacters.set([]);
        isCombatMode.set(false);
    }

    function nextBattleround() {
        combatCharacters.set([]);
        isCombatMode.set(false);
    }

    function updateInitiative(character, event) {
        const newInitiative = parseInt(event.target.value, 10);
        updateGMCharacter(character, { initiative: newInitiative });
        updateCombatCharacter(character, { initiative: newInitiative });
    }

    function removeFromGMTable(character) {
        removeGMCharacter(character);
        combatCharacters.update(chars => chars.filter(char => char !== character));
    }

    function toggleVisibility(character) {
        character.toggleVisibility();
        updateGMCharacter(character, { isVisible: character.getVisibility() });
        updateCombatCharacter(character, { isVisible: character.getVisibility() });
    }

    function incrementStat(character, stat) {
        if(stat === "woundModifiers") {
            if(character[stat] < 0) {
                updateGMCharacter(character, { [stat] : character[stat] + 1 });
                updateCombatCharacter(character, { [stat] : character[stat] - 1 });
            }
        } else {
            updateGMCharacter(character, { [stat] : character[stat] + 1 });
            updateCombatCharacter(character, { [stat] : character[stat] - 1 });
        }
    }

    function decrementStat(character, stat) {
        if(stat === "woundModifiers") {
            updateGMCharacter(character, { [stat] : character[stat] - 1 });
            updateCombatCharacter(character, { [stat] : character[stat] - 1 });
        } else if(character[stat] - 1 >= 0) {
            updateGMCharacter(character, { [stat] : character[stat] - 1 });
            updateCombatCharacter(character, { [stat] : character[stat] - 1 });
        }
    }

    function updateCombatCharacter(character, updates) {
        combatCharacters.update(chars => {
            const index = chars.indexOf(character);
            if (index !== -1) {
                Object.assign(chars[index], updates);
            }
            return chars;
        });
    }
</script>