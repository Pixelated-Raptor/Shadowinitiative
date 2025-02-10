import { writable } from "svelte/store";
import { Character } from "./Character";

const localStorageKey = "shadowinitiative_sl_characters";

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
    GMCharacters.update(currentCharacters => {
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
        const index = currentCharacters.indexOf(character);
        if (index !== -1) {
            const updatedCharacter = Object.assign(Object.create(Object.getPrototypeOf(character)), character, updates);
            currentCharacters[index] = updatedCharacter;
            saveGMCharacters(currentCharacters);
        }
        return currentCharacters;
    });
}