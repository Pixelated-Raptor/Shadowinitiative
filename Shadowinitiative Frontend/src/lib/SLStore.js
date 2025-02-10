import { writable } from "svelte/store";
import { Character } from "./Character";

const localStorageKey = "shadowinitiative_sl_characters";

function loadSLCharacters() {
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

function saveSLCharacters(characters) {
    localStorage.setItem(localStorageKey, JSON.stringify(characters));
}

export const slCharacters = writable(loadSLCharacters());

slCharacters.subscribe(value => {
    saveSLCharacters(value);
});

export function addSLCharacter(character) {
    slCharacters.update(currentCharacters => {
        const updatedCharacters = [...currentCharacters, character];
        saveSLCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function removeSLCharacter(character) {
    slCharacters.update(currentCharacters => {
        const updatedCharacters = currentCharacters.filter(char => char !== character);
        saveSLCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function updateSLCharacter(character, updates) {
    slCharacters.update(currentCharacters => {
        const index = currentCharacters.indexOf(character);
        if (index !== -1) {
            const updatedCharacter = Object.assign(Object.create(Object.getPrototypeOf(character)), character, updates);
            currentCharacters[index] = updatedCharacter;
            saveSLCharacters(currentCharacters);
        }
        return currentCharacters;
    });
}