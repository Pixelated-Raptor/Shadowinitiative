<!-- List available characters and allow modification of their base(!) stats. -->

<ul>
    {#each $characters as char}
      <li>
        Name: {char.getName()} |
        Ini: {char.getInitiative()} |
        Ini-D: <button on:click={() => incrementStat(char, "baseInitiativePasses")}>+</button> {char.getBaseInitiativePasses()} <button on:click={() => decrementStat(char, "baseInitiativePasses")}>-</button> |
        Reaktion: <button on:click={() => incrementStat(char, "baseReaction")}>+</button> {char.getBaseReaction()} <button on:click={() => decrementStat(char, "baseReaction")}>-</button> |
        Intuition: <button on:click={() => incrementStat(char, "baseIntuition")}>+</button> {char.getBaseIntuition()} <button on:click={() => decrementStat(char, "baseIntuition")}>-</button> |
        Edge: <button on:click={() => incrementStat(char, "edge")}>+</button> {char.getEdge()} <button on:click={() => decrementStat(char, "edge")}>-</button> |
        Wound Modifiers: <button on:click={() => incrementStat(char, "woundModifiers")}>+</button> {char.getWoundModifiers()} <button on:click={() => decrementStat(char, "woundModifiers")}>-</button> |
        <button on:click={() => deleteCharacter(char)}>Löschen</button>
        <button on:click={() => addGMCharacter(char)}>In SL übernehmen</button>
      </li>
    {/each}
</ul>



<script>
    import { characters, deleteCharacter, updateCharacter } from "./CharacterStore";
    import { addGMCharacter } from "./GMStore";

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

    /*function resetAllStats(character) {
        updateCharacter(character, {
            moddedReaction: character.getBaseReaction(),
            moddedIntuition: character.getBaseIntuition(),
            moddedInitiativePasses: character.getBaseInitiativePasses(),
            woundModifiers: 0
        });
    }*/
</script>