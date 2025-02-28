<script>
    import { get } from "svelte/store";
    import { combatCharacters, currentIniPass } from "./GMStore.js";

    // Neu: nutze initiativeSuccesses anstelle von initiativeResult
    function getEffectiveInitiative(char) {
        const baseIni = char.getModdedReaction() + char.getModdedIntuition();
        // Nutzt nun initiativeSuccesses, das in der GM Tabelle aktualisiert wird
        const probeResult = char.initiativeSuccesses || 0;
        return baseIni + probeResult + char.getWoundModifiers();
    }

    function isVisible(char) {
        if (typeof char.getVisibility === "function") {
            return char.getVisibility();
        }
        return char.isVisible === true;
    }

    $: console.log("PC-Table: combatCharacters:", $combatCharacters);
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Initiative-Ergebnis</th>
            <th>INI-Durchgänge</th>
            <th>Aktionen</th>
        </tr>
    </thead>
    <tbody>
        {#each $combatCharacters as char}
            <tr class:active={getEffectiveInitiative(char) > 0}>
                <td>{char.getName()}</td>
                <td>{getEffectiveInitiative(char)}</td>
                <td>{char.roundInitiativePasses}</td>
                <td>
                    {#if char.actions && char.actions[$currentIniPass]}
                        {char.actions[$currentIniPass].join(", ")}
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 0.5rem;
        text-align: center;
    }
    .active {
        background-color: #fdd;
    }
</style>