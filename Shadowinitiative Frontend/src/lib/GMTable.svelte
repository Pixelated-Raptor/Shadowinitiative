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
            {#each $combatCharacters.sort((a, b) => getEffectiveInitiative(b) - getEffectiveInitiative(a)) as char}
            <tr class:active={isCharacterActive(char)}>
                <td>
                    {char.getName()} |
                    Reaktion: <button on:click={() => incrementStat(char, "moddedReaction")}>+</button> {char.getModdedReaction()} <button on:click={() => decrementStat(char, "moddedReaction")}>-</button> |
                    Intuition: <button on:click={() => incrementStat(char, "moddedIntuition")}>+</button> {char.getModdedIntuition()} <button on:click={() => decrementStat(char, "moddedIntuition")}>-</button> |
                    Ini-D: <button on:click={() => incrementStat(char, "moddedInitiativePasses")}>+</button> {char.getModdedInitiativePasses()} <button on:click={() => decrementStat(char, "moddedInitiativePasses")}>-</button> |
                    Wound Modifiers: <button on:click={() => incrementStat(char, "woundModifiers")}>+</button> {char.getWoundModifiers()} <button on:click={() => decrementStat(char, "woundModifiers")}>-</button>
                </td>
                <td>{getEffectiveInitiative(char)}</td>
                <td><input type="checkbox" checked={char.getVisibility()} on:change={() => toggleVisibility(char)} /></td>
                {#each [1,2,3,4] as pass}
                <td>
                    {#if pass === $currentIniPass}
                        {#if isCharacterActive(char)}
                            <!-- Normale Aktionsbuttons -->
                            <button on:click={() => recordAction(char, pass, 'Frei')}>Frei</button>
                            <button on:click={() => recordAction(char, pass, 'Einfach')}>Einfach</button>
                            <button on:click={() => recordAction(char, pass, 'Komplex')}>Komplex</button>
                            <button on:click={() => delayAction(char, pass)}>Verzögern</button>
                        {:else if char.delayed}
                            <!-- Für verzögerte Charaktere: Möglichkeit, nun sofort zu handeln -->
                            <button on:click={() => activateDelayed(char, pass)}>Jetzt handeln</button>
                        {/if}
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
                <th>Erfolge Initiativeergebnis</th>
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
                    <input type="number" value={char.initiativeSuccesses || 0} on:input={(event) => updateInitiativeSuccesses(char, event)}/>
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

    // Helper: Berechnet den effektiven Initiativewert dynamisch:
    // (Reaktion + Intuition) + Initiative-Erfolge + Wound Modifier.
    function getEffectiveInitiative(char) {
        const baseIni = char.getModdedReaction() + char.getModdedIntuition();
        const successes = char.initiativeSuccesses || 0;
        return baseIni + successes + char.getWoundModifiers();
    }

    // Aktualisiert die Initiative-Erfolge (bei der Initiativeprobe) und speichert den Wert.
    function updateInitiativeSuccesses(character, event) {
        const newSuccesses = parseInt(event.target.value, 10);
        updateGMCharacter(character, { initiativeSuccesses: newSuccesses });
        updateCombatCharacter(character, { initiativeSuccesses: newSuccesses });
    }

    // Startet den Kampf und initialisiert für jeden Charakter ein "actions"-Objekt sowie delayed.
    function startCombat() {
        if (get(GMCharacters).length !== 0) {
            const combatChars = get(GMCharacters).map(char => {
                char.actions = {}; // initialisieren
                char.delayed = false; // verzögerungs-Flag initialisieren
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

    // Verzögert die Aktion eines Charakters, d.h. löscht bereits eingetragene Aktionen
    // für den aktuellen INI-Durchgang, setzt den Flag "delayed" und ruft checkPassCompletion()
    // auf.
    function delayAction(character, pass) {
        // Lösche alle im aktuellen Durchgang bereits eingetragenen Aktionen
        const updatedActions = { ...character.actions, [pass]: [] };
        updateCombatCharacter(character, { actions: updatedActions, delayed: true });
        updateGMCharacter(character, { actions: updatedActions, delayed: true });
        checkPassCompletion();
    }

    // Markiert alle aktiven Charaktere im aktuellen Durchgang (mit höchstem effektivem INI-Ergebnis) als "fertig"
    function nextCharacter() {
        const pass = get(currentIniPass);
        // Nur Charaktere berücksichtigen, die nicht verzögert haben und noch nicht "fertig" sind.
        const nonDelayedEligible = get(combatCharacters).filter(char =>
            char.getModdedInitiativePasses() >= pass &&
            getEffectiveInitiative(char) > 0 &&
            !(char.actions && char.actions[pass] && char.actions[pass].includes("fertig")) &&
            !char.delayed
        );
        if (nonDelayedEligible.length > 0) {
            const maxEffective = Math.max(...nonDelayedEligible.map(c => getEffectiveInitiative(c)));
            const activeGroup = nonDelayedEligible.filter(c => getEffectiveInitiative(c) === maxEffective);
            activeGroup.forEach(char => {
                // Markiere diese Charaktere als "fertig"
                const updatedActions = { ...char.actions };
                updatedActions[pass] = [...(updatedActions[pass] || []), "fertig"];
                updateCombatCharacter(char, { actions: updatedActions });
            });
            checkPassCompletion();
        } else {
            let nextPass = pass + 1;
            const eligiblePass = get(combatCharacters).some(char =>
                char.getModdedInitiativePasses() >= nextPass &&
                getEffectiveInitiative(char) > 0
            );
            if (eligiblePass) {
                currentIniPass.set(nextPass);
            } else {
                nextBattleround();
            }
        }
    }

    function checkPassCompletion() {
        const pass = get(currentIniPass);
        const eligible = get(combatCharacters).filter(char =>
            char.getModdedInitiativePasses() >= pass &&
            getEffectiveInitiative(char) > 0 &&
            !char.delayed &&
            !(char.actions && char.actions[pass] && char.actions[pass].includes("fertig"))
        );
        if (eligible.length === 0) {
            let nextPass = pass + 1;
            const eligiblePass = get(combatCharacters).some(char =>
                char.getModdedInitiativePasses() >= nextPass &&
                getEffectiveInitiative(char) > 0
            );
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
        if (character.delayed) {
            updateCombatCharacter(character, { delayed: false });
            updateGMCharacter(character, { delayed: false });
        }
        checkPassCompletion();
    }

    // Ein Charakter gilt als aktiv, wenn:
    // - er im aktuellen Durchgang teilnehmen kann,
    // - sein effektives Initiativeergebnis > 0 ist,
    // - noch nicht als "fertig" markiert wurde und
    // - sein effektives INI-Ergebnis dem Maximum unter den eligible Charakteren entspricht.
    function isCharacterActive(char) {
        const pass = get(currentIniPass);
        if (char.getModdedInitiativePasses() < pass) return false;
        if (getEffectiveInitiative(char) <= 0) return false;
        const done = char.actions && char.actions[pass] && char.actions[pass].includes("fertig");
        if (done) return false;
        // Hier werden nur Charaktere berücksichtigt, die NICHT verzögert haben:
        const eligible = get(combatCharacters).filter(c =>
            c.getModdedInitiativePasses() >= pass &&
            getEffectiveInitiative(c) > 0 &&
            !(c.actions && c.actions[pass] && c.actions[pass].includes("fertig")) &&
            !c.delayed
        );
        if (eligible.length === 0) return false;
        const maxEffective = Math.max(...eligible.map(c => getEffectiveInitiative(c)));
        const active = getEffectiveInitiative(char) === maxEffective;
        return active;
    }

    // Zusätzliche Funktion, die einen verzögerten Charakter sofort aktiviert.
    function activateDelayed(character, pass) {
        updateCombatCharacter(character, { delayed: false });
        updateGMCharacter(character, { delayed: false });
        // Um den Charakter aktiv zu machen, kann checkPassCompletion() aufgerufen werden.
        checkPassCompletion();
    }
</script>