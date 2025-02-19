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
                <th>KO</th>  <!-- Neue Spalte -->
            </tr>
        </thead>
        <tbody>
            {#each $combatCharacters.sort((a, b) => getEffectiveInitiative(b) - getEffectiveInitiative(a)) as char}
            <tr class:active={isCharacterActive(char)} class:ko={char.ko}>
                <td>
                    {char.getName()} |
                    Reaktion: <button on:click={() => incrementStat(char, "moddedReaction")}>+</button> {char.getModdedReaction()} <button on:click={() => decrementStat(char, "moddedReaction")}>-</button> |
                    Intuition: <button on:click={() => incrementStat(char, "moddedIntuition")}>+</button> {char.getModdedIntuition()} <button on:click={() => decrementStat(char, "moddedIntuition")}>-</button> |
                    Ini-D: <button on:click={() => incrementStat(char, "moddedInitiativePasses")}>+</button> {char.roundInitiativePasses} <button on:click={() => decrementStat(char, "moddedInitiativePasses")}>-</button> |
                    Wound Modifiers: <button on:click={() => incrementStat(char, "woundModifiers")}>+</button> {char.getWoundModifiers()} <button on:click={() => decrementStat(char, "woundModifiers")}>-</button>
                </td>
                <td>{getEffectiveInitiative(char)}</td>
                <td>
                    <input type="checkbox" checked={char.getVisibility()} on:change={() => toggleVisibility(char)} />
                </td>
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
                <!-- Neue Spalte KO -->
                <td>
                    {#if char.ko}
                        <button on:click={() => toggleKO(char)}>Bereit</button>
                    {:else}
                        <button on:click={() => toggleKO(char)}>K.O.</button>
                    {/if}
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={endCombat}>Kampf beenden</button>
    <button on:click={nextBattleround}>Nächste Kampfrunde</button>
    <button on:click={nextCharacter}>Nächster Charakter</button>
{:else}
    <!-- GM-Tabelle ohne KO-Spalte -->
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
            <tr class:ko={char.ko}>
                <td>{char.getName()}</td>
                <td>{char.getInitiative()}</td>
                <td>{char.getModdedInitiativePasses()}</td>
                <td>{char.getModdedReaction()}</td>
                <td>{char.getModdedIntuition()}</td>
                <td>{char.getWoundModifiers()}</td>
                <td>
                    <input type="number" value={char.initiativeSuccesses || 0} on:input={(event) => updateInitiativeSuccesses(char, event)}/>
                </td>
                <td>
                    <input type="checkbox" on:change={() => toggleVisibility(char)} checked={char.getVisibility()}/>
                </td>
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
    /* .ko-Klasse streicht den Zeilentext durch */
    .ko {
        text-decoration: line-through;
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
                char.actions = {};           // initialisieren
                char.delayed = false;        // verzögerungs-Flag initialisieren
                char.roundInitiativePasses = char.getModdedInitiativePasses(); // aktuellen Wert sichern
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
            !char.delayed &&
            !char.ko
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
                getEffectiveInitiative(char) > 0 &&
                !char.ko
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
            !(char.actions && char.actions[pass] && char.actions[pass].includes("fertig")) &&
            !char.ko
        );
        if (eligible.length === 0) {
            let nextPass = pass + 1;
            const eligiblePass = get(combatCharacters).some(char =>
                char.getModdedInitiativePasses() >= nextPass &&
                getEffectiveInitiative(char) > 0 &&
                !char.ko
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
        if (stat === "moddedInitiativePasses") {
            // Hole den aktuellen Wert aus dem GM-Store
            const currentValue = getGMModdedInitiativePasses(character);
            const newValue = currentValue + 1;
            console.log(
                `[incrementStat] ${character.getName()} - Increasing moddedInitiativePasses from ${currentValue} to ${newValue}. (Bonus applies next round)`
            );
            // Es wird nur der GM‑Store aktualisiert – der Bonus wird in der nächsten Kampfrunde wirksam.
            updateGMCharacter(character, { moddedInitiativePasses: newValue });
        } else if (stat === "woundModifiers") {
            if (character[stat] < 0) {
                updateGMCharacter(character, { [stat]: character[stat] + 1 });
                updateCombatCharacter(character, { [stat]: character[stat] + 1 });
                console.log(
                    `[incrementStat] ${character.getName()} - woundModifiers increased to ${character[stat] + 1}`
                );
            }
        } else {
            updateGMCharacter(character, { [stat]: character[stat] + 1 });
            updateCombatCharacter(character, { [stat]: character[stat] + 1 });
            console.log(
                `[incrementStat] ${character.getName()} - ${stat} increased to: ${character[stat] + 1}`
            );
        }
    }

    function decrementStat(character, stat) {
        console.log(
            `[decrementStat] ${character.getName()} - stat: ${stat} current:`,
            stat === "moddedInitiativePasses" ? character.getModdedInitiativePasses() : character[stat]
        );
        
        if (stat === "woundModifiers") {
            const newValue = character.getWoundModifiers() - 1;
            updateGMCharacter(character, { woundModifiers: newValue });
            updateCombatCharacter(character, { woundModifiers: newValue });
            console.log(`[decrementStat] ${character.getName()} - woundModifiers decreased to ${newValue}`);
        } else if (stat === "moddedInitiativePasses") {
            const currentValue = character.getModdedInitiativePasses();
            const newValue = currentValue - 1;
            updateGMCharacter(character, { moddedInitiativePasses: newValue });
            // Verlust wirkt sofort in der Kampfrunde:
            updateCombatCharacter(character, { moddedInitiativePasses: newValue, roundInitiativePasses: newValue });
            console.log(
                `[decrementStat] ${character.getName()} - moddedInitiativePasses decreased to ${newValue} (roundInitiativePasses updated to ${newValue})`
            );
        } else if (character[stat] - 1 >= 0) {
            const newValue = character[stat] - 1;
            updateGMCharacter(character, { [stat]: newValue });
            updateCombatCharacter(character, { [stat]: newValue });
            console.log(`[decrementStat] ${character.getName()} - ${stat} decreased to: ${newValue}`);
        }
    }

    function updateCombatCharacter(character, updates) {
        console.log(`[updateCombatCharacter] ${character.getName()} - Updates:`, updates);
        combatCharacters.update(chars => {
            return chars.map(char => {
                if (char.getName() === character.getName()) {
                    const newChar = Object.assign(
                        Object.create(Object.getPrototypeOf(char)),
                        char,
                        updates
                    );
                    console.log(`[updateCombatCharacter] Updated character:`, newChar);
                    return newChar;
                }
                return char;
            });
        });
    }

    // Speichert die ausgewählte Aktion (Frei, Einfach, Komplex) 
    // Hier sammeln wir einfach alle Aktionen in einem Array für den aktuellen INI-Durchgang.
    function recordAction(character, pass, actionType) {
        console.log(`[recordAction] ${character.getName()} - pass: ${pass} actionType: ${actionType}`);
        const previous = character.actions[pass] || [];
        const newActions = [ ...previous, actionType ];
        updateCombatCharacter(character, { actions: { ...character.actions, [pass]: newActions } });
        if (character.delayed) {
            updateCombatCharacter(character, { delayed: false });
            updateGMCharacter(character, { delayed: false });
            console.log(`[recordAction] ${character.getName()} - delayed flag reset`);
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
        if (char.ko) return false;
        // Nutzung des aktuellen Kampfrundenwerts:
        if ((char.roundInitiativePasses || char.getModdedInitiativePasses()) < pass) return false;
        if (getEffectiveInitiative(char) <= 0) return false;
        const done = char.actions && char.actions[pass] && char.actions[pass].includes("fertig");
        if (done) return false;
        // Nur Charaktere, die NICHT verzögert und nicht KO sind:
        const eligible = get(combatCharacters).filter(c =>
            (c.roundInitiativePasses || c.getModdedInitiativePasses()) >= pass &&
            getEffectiveInitiative(c) > 0 &&
            !(c.actions && c.actions[pass] && c.actions[pass].includes("fertig")) &&
            !c.delayed && !c.ko
        );
        if (eligible.length === 0) return false;
        const maxEffective = Math.max(...eligible.map(c => getEffectiveInitiative(c)));
        const active = getEffectiveInitiative(char) === maxEffective;
        return active;
    }

    // Zusätzliche Funktion, die einen verzögerten Charakter sofort aktiviert.
    function activateDelayed(character, pass) {
        console.log(`[activateDelayed] ${character.getName()} - activating delayed for pass ${pass}`);
        updateCombatCharacter(character, { delayed: false });
        updateGMCharacter(character, { delayed: false });
        checkPassCompletion();
    }

    // Neue Funktion zum Umschalten des KO-Status:
    function toggleKO(character) {
        const newState = !character.ko;
        updateGMCharacter(character, { ko: newState });
        updateCombatCharacter(character, { ko: newState });
    }

    // Liefert den in GMCharacters gespeicherten moddedInitiativePasses‑Wert des Charakters.
    function getGMModdedInitiativePasses(char) {
        const gmChars = get(GMCharacters);
        const gmChar = gmChars.find(c => c.getName() === char.getName());
        const value = gmChar ? gmChar.getModdedInitiativePasses() : char.getModdedInitiativePasses();
        console.log(`[getGMModdedInitiativePasses] ${char.getName()} GM stored moddedInitiativePasses: ${value}`);
        return value;
    }
</script>