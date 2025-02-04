import { writable } from "svelte/store";
import { Character } from "./Character";

const localStorageKey = "shadowinitiative_characters";

function loadCharacters() {
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

function saveCharacters(characters) {
    localStorage.setItem(localStorageKey, JSON.stringify(characters));
}

export const characters = writable(loadCharacters());

characters.subscribe(value => {
    saveCharacters(value);
});

export function addCharacter(name, reaction, intuition, initiativePasses, edge, woundModifiers) {
    const newCharacter = new Character(name, reaction, intuition, initiativePasses, edge, woundModifiers);
    characters.update(currentCharacters => {
        const updatedCharacters = [...currentCharacters, newCharacter];
        saveCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function deleteCharacter(character) {
    characters.update(currentCharacters => {
        const updatedCharacters = currentCharacters.filter(char => char !== character);
        saveCharacters(updatedCharacters);
        return updatedCharacters;
    });
}

export function updateCharacter(character, updates) {
    characters.update(currentCharacters => {
        const index = currentCharacters.indexOf(character);
        if (index !== -1) {
            const updatedCharacter = Object.assign(Object.create(Object.getPrototypeOf(character)), character, updates);
            currentCharacters[index] = updatedCharacter;
            saveCharacters(currentCharacters);
        }
        return currentCharacters;
    });
}