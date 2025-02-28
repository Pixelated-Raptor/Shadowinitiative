import { writable } from "svelte/store";
import { Character } from "./Character";

const localStorageKey = "shadowinitiative_gm_characters";

export const currentIniPass = writable(1);
export const combatCharacters = writable([]);
export const GMCharacters = writable(loadGMCharacters());

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

GMCharacters.subscribe(value => {
    saveGMCharacters(value);
});

// -------------------------------------------------
// Synchronization via BroadcastChannel
const bc = new BroadcastChannel('gm-store');

const isPCWindow = window.location.pathname.includes("pc-window.html");

// Nur das "Hauptfenster" sendet Updates
if (!isPCWindow) {
    combatCharacters.subscribe(value => {
        bc.postMessage({ type: 'combatCharacters', data: value });
    });
}

// Beide Fenster empfangen Updates
bc.onmessage = (event) => {
    if (event.data.type === 'combatCharacters') {
        const rehydrated = event.data.data.map(data => {
            const char = new Character(
                data.name,
                data.baseReaction,
                data.baseIntuition,
                data.baseInitiativePasses,
                data.edge,
                data.woundModifiers
            );
            // Kopiere die zusätzlichen, während des Kampfes aktualisierten Eigenschaften:
            char.moddedReaction = data.moddedReaction;
            char.moddedIntuition = data.moddedIntuition;
            char.moddedInitiativePasses = data.moddedInitiativePasses;
            // Neuberechnung des Initiativeergebnisses:
            const successes = data.initiativeSuccesses || 0;
            const reaction = char.moddedReaction != null ? char.moddedReaction : char.baseReaction;
            const intuition = char.moddedIntuition != null ? char.moddedIntuition : char.baseIntuition;
            char.initiativeResult = reaction + intuition + successes + char.woundModifiers;
            char.isVisible = data.isVisible;
            char.actions = data.actions;
            char.delayed = data.delayed;
            char.extraPassUsed = data.extraPassUsed;
            char.roundInitiativePasses = data.roundInitiativePasses;
            return char;
        });
        combatCharacters.set(rehydrated);
    }
};

export function addGMCharacter(character) {
    character.setModdedInitiativePasses(character.getBaseInitiativePasses());
    character.setModdedReaction(character.getBaseReaction());
    character.setModdedIntuition(character.getBaseIntuition());

    GMCharacters.update(currentCharacters => {
        if (currentCharacters.some(char => char.getName() === character.getName())) {
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