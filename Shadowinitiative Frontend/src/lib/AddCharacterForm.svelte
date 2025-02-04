<form onsubmit={submitCharacter}>
    <div class="form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br>
    </div>

    <div class="form">
        <label for="reaction">Reaktion:</label>
        <input type="number" id="reaction" name="reaction" value="3" min="0" max="99"><br>
    </div>

    <div class="form">
        <label for="intuition">Intuition:</label>
        <input type="number" id="intuition" name="intuition" value="3" min="0" max="99"><br>
    </div>

    <div class="form">    
        <label for="initiativePasses">Initiative-Durchgänge:</label>
        <input type="number" id="initiativePasses" name="initiativePasses" value="2" min="0" max="99"><br>
    </div>

    <div class="form">
        <label for="edge">Edge:</label>
        <input type="number" id="edge" name="edge" value="3" min="0" max="99"><br>
    </div>

    <div class="form">    
        <label for="woundModifiers">Verletzungsmodifikatoren</label>
        <input type="number" id="woundModifiers" name="woundModifiers" value="0" min="-99" max="0"><br>
    </div>

    <input type="submit" value="Hinzufügen">
</form>



<script>
    import { addCharacter } from "./CharacterStore";

    function submitCharacter(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const name = formData.get("name");
        const reaction = formData.get("reaction");
        const intuition = formData.get("intuition");
        const initiativePasses = formData.get("initiativePasses");
        const edge = formData.get("edge");
        const woundModifiers = formData.get("woundModifiers");

        addCharacter(name, reaction, intuition, initiativePasses, edge, woundModifiers);
        event.target.reset();
    }
</script>



<style lang="css">
    form {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .form {
        margin-bottom: 5px;
    }
</style>