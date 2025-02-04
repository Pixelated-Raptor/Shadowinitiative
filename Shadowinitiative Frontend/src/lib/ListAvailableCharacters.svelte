<ul>
    {#each $characters as char}
      <li>
        Name: {char.getName()} |
        Ini: {char.getInitiative()} |
        Ini-D: {char.getModdedInitiativePasses()} <button on:click={() => incrementStat(char, "moddedInitiativePasses")}>+Ini-D</button> <button on:click={() => decrementStat(char, "moddedInitiativePasses")}>-Ini-D</button> |
        Reaktion: {char.getModdedReaction()} <button on:click={() => incrementStat(char, "moddedReaction")}>+Rea</button> <button on:click={() => decrementStat(char, "moddedReaction")}>-Rea</button> |
        Intuition: {char.getModdedIntuition()} <button on:click={() => incrementStat(char, "moddedIntuition")}>+Int</button> <button on:click={() => decrementStat(char, "moddedIntuition")}>-Int</button> |
        Wound Modifiers: {char.getWoundModifiers()} <button on:click={() => incrementStat(char, "woundModifiers")}>+Wound Mod.</button> <button on:click={() => decrementStat(char, "woundModifiers")}>-Wound Mod.</button>
        <button on:click={() => toggleVisibility(char)}>{ char.getVisibility() ? "Verstecken" : "Anzeigen" }</button>
        <button on:click={() => resetAllStats(char)}>Reset Stats</button>
        <button on:click={() => deleteCharacter(char)}>Löschen</button>
      </li>
    {/each}
</ul>



<script>
    import { characters, deleteCharacter, updateCharacter } from "./CharacterStore";

    function incrementStat(character, stat) {
        if(stat === "woundModifiers") {
            if(character[stat] < 0) {
                updateCharacter(character, { [stat] : character[stat] + 1 });
            }
        } else {
            updateCharacter(character, { [stat] : character[stat] + 1 });
        }
    }

    function decrementStat(character, stat) {
        if(stat === "woundModifiers") {
            updateCharacter(character, { [stat] : character[stat] - 1 });
        } else if(character[stat] - 1 >= 0) {
            updateCharacter(character, { [stat] : character[stat] - 1 });
        }
    }

    function toggleVisibility(character) {
        character.toggleVisibility();
        updateCharacter(character, { isVisible: character.getVisibility() });
    }

    function resetAllStats(character) {
        updateCharacter(character, {
            moddedReaction: character.getBaseReaction(),
            moddedIntuition: character.getBaseIntuition(),
            moddedInitiativePasses: character.getBaseInitiativePasses(),
            woundModifiers: 0
        });
    }
</script>