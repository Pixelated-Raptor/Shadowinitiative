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
            <tr class:active={isCharacterActive(char)}>
                <td>
                    {char.getName()} |
                    Reaktion: <button on:click={() => incrementStat(char, "moddedReaction")}>+</button> {char.getModdedReaction()} <button on:click={() => decrementStat(char, "moddedReaction")}>-</button> |
                    Intuition: <button on:click={() => incrementStat(char, "moddedIntuition")}>+</button> {char.getModdedIntuition()} <button on:click={() => decrementStat(char, "moddedIntuition")}>-</button> |
                    Ini-D: <button on:click={() => incrementStat(char, "moddedInitiativePasses")}>+</button> {char.getModdedInitiativePasses()} <button on:click={() => decrementStat(char, "moddedInitiativePasses")}>-</button> |
                    Wound Modifiers: <button on:click={() => incrementStat(char, "woundModifiers")}>+</button> {char.getWoundModifiers()} <button on:click={() => decrementStat(char, "woundModifiers")}>-</button>
                </td>
                <td>{char.initiative}</td>
                <td><input type="checkbox" checked={char.getVisibility()} on:change={() => toggleVisibility(char)} /></td>
                {#each [1,2,3,4] as pass}
                <td>
                    {#if pass === $currentIniPass && isCharacterActive(char)}
                        <!-- Nur im aktuellen Durchgang werden die Aktionsknöpfe angezeigt -->
                        <button on:click={() => recordAction(char, pass, 'Frei')}>Frei</button>
                        <button on:click={() => recordAction(char, pass, 'Einfach')}>Einfach</button>
                        <button on:click={() => recordAction(char, pass, 'Komplex')}>Komplex</button>
                        {#if char.actions && char.actions[pass]}
                            <div>{char.actions[pass].join(", ")}</div>
                        {/if}
                    {:else if char.actions && char.actions[pass]}
                        <div>{char.actions[pass].join(", ")}</div>
                    {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={endCombat}>Kampf beenden</button>
    <button on:click={nextBattleround}>Nächste Kampfrunde</button>
    <button on:click={nextCharacter}>Nächster Charakter</button>
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



<style>
    .active {
        background-color: #fdd;
    }
</style>



<script>
    import { GMCharacters, updateGMCharacter, removeGMCharacter } from "./GMStore";
    import { writable, get } from "svelte/store";

    let isCombatMode = writable(false);
    let combatCharacters = writable([]);
    let currentIniPass = writable(1);

    // Startet den Kampf und initialisiert für jeden Charakter ein "actions"-Objekt
    function startCombat() {
        if (get(GMCharacters).length !== 0) {
            const combatChars = get(GMCharacters).map(char => {
                char.actions = {}; // initialisieren
                return char;
            });
            combatCharacters.set(combatChars);
            isCombatMode.set(true);
            currentIniPass.set(1);
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

    // Markiert alle aktiven Charaktere (die aktuell die höchste Initiative im aktuellen Durchgang haben) als "fertig"
    function nextCharacter() {
        const pass = get(currentIniPass);
        // Alle Charaktere, die im aktuellen Durchgang noch nicht fertig sind und ausreichend INI-D haben:
        const eligible = get(combatCharacters).filter(char =>
            char.getModdedInitiativePasses() >= pass &&
            !(char.actions && char.actions[pass] && char.actions[pass].includes("fertig"))
        );
        if (eligible.length > 0) {
            // Ermittle den höchsten Initiativewert unter den eligible Charakteren.
            const maxInitiative = Math.max(...eligible.map(c => c.initiative));
            // Wähle alle Charaktere mit diesem Initiativwert als aktive Gruppe.
            const activeGroup = eligible.filter(c => c.initiative === maxInitiative);
            // Markiere alle aktiven Charaktere als fertig.
            activeGroup.forEach(char => {
                const updatedActions = { ...char.actions };
                updatedActions[pass] = [...(updatedActions[pass] || []), "fertig"];
                updateCombatCharacter(char, { actions: updatedActions });
            });
            checkPassCompletion();
        } else {
            // Falls keine eligible Charaktere mehr im aktuellen Durchgang, prüfe, ob der nächste Durchgang existiert.
            let nextPass = pass + 1;
            const eligiblePass = get(combatCharacters).some(char => char.getModdedInitiativePasses() >= nextPass);
            if (eligiblePass) {
                currentIniPass.set(nextPass);
            } else {
                nextBattleround();
            }
        }
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
                updateCombatCharacter(character, { [stat] : character[stat] + 1 });
            }
        } else {
            updateGMCharacter(character, { [stat] : character[stat] + 1 });
            updateCombatCharacter(character, { [stat] : character[stat] + 1 });
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

    // Speichert die ausgewählte Aktion (Frei, Einfach, Komplex) 
    // Hier sammeln wir einfach alle Aktionen in einem Array für den aktuellen INI-Durchgang.
    function recordAction(character, pass, actionType) {
        const previous = character.actions[pass] || [];
        const newActions = [ ...previous, actionType ];
        updateCombatCharacter(character, { actions: { ...character.actions, [pass]: newActions } });
        checkPassCompletion();
    }

    // Prüft, ob im aktuellen Durchgang noch eligible Charaktere vorhanden sind.
    // Wenn nicht, wird in den nächsten INI-Durchgang gewechselt oder die Kampfrunde beendet.
    function checkPassCompletion() {
        const pass = get(currentIniPass);
        const eligible = get(combatCharacters).filter(char =>
            char.getModdedInitiativePasses() >= pass &&
            !(char.actions && char.actions[pass] && char.actions[pass].includes("fertig"))
        );
        if (eligible.length === 0) {
            let nextPass = pass + 1;
            const eligiblePass = get(combatCharacters).some(char => char.getModdedInitiativePasses() >= nextPass);
            if (eligiblePass) {
                currentIniPass.set(nextPass);
            } else {
                nextBattleround();
            }
        }
    }

    // Ein Charakter gilt als aktiv, wenn er in diesem Durchgang noch nicht als "fertig" markiert ist
    // UND seinen Initiativewert gleich dem Maximum unter den eligible Charakteren hat.
    function isCharacterActive(char) {
        const pass = get(currentIniPass);
        if (char.getModdedInitiativePasses() < pass) return false;
        const done = char.actions && char.actions[pass] && char.actions[pass].includes("fertig");
        if (done) return false;
        const eligible = get(combatCharacters).filter(c =>
            c.getModdedInitiativePasses() >= pass &&
            !(c.actions && c.actions[pass] && c.actions[pass].includes("fertig"))
        );
        if (eligible.length === 0) return false;
        const maxInitiative = Math.max(...eligible.map(c => c.initiative));
        return char.initiative === maxInitiative;
    }
</script>