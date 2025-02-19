import { writable } from "svelte/store";
import { Character } from "./Character";

const localStorageKey = "shadowinitiative_gm_characters";

function loadGMCharacters() {
    const storedCharacters = localStorage.getItem(localStorageKey);
    if (storedCharacters) {
        return JSON.parse(storedCharacters).map(char => new Character(
            char.name,
            char.baseReaction,
            char.baseIntuition,
            char.baseInitiativePasses,
            char.edge,
            char.woundModifiers
        ));
    }
    return [];
}

function saveGMCharacters(characters) {
    localStorage.setItem(localStorageKey, JSON.stringify(characters));
}

export const GMCharacters = writable(loadGMCharacters());

GMCharacters.subscribe(value => {
    saveGMCharacters(value);
});

export function addGMCharacter(character) {
    character.setModdedInitiativePasses(character.getBaseInitiativePasses());
    character.setModdedReaction(character.getBaseReaction());
    character.setModdedIntuition(character.getBaseIntuition());

    GMCharacters.update(currentCharacters => {
        // Prüfe anhand des Namens, ob der Charakter bereits existiert.
        if (currentCharacters.some(char => char.getName() === character.getName())) {
            // Bereits vorhanden – nichts hinzufügen.
            return currentCharacters;
        }
        const updatedCharacters = [...currentCharacters, character];
        saveGMCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function removeGMCharacter(character) {
    GMCharacters.update(currentCharacters => {
        const updatedCharacters = currentCharacters.filter(char => char !== character);
        saveGMCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function updateGMCharacter(character, updates) {
    GMCharacters.update(currentCharacters => {
        const updatedCharacters = currentCharacters.map(char => {
            if (char.getName() === character.getName()) {
                // Erzeuge einen neuen Charakter, wobei der Prototyp beibehalten wird
                return Object.assign(
                    Object.create(Object.getPrototypeOf(char)),
                    char,
                    updates
                );
            }
            return char;
        });
        saveGMCharacters(updatedCharacters);
        return updatedCharacters;
    });
}