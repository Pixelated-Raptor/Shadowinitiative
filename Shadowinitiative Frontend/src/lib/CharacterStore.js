import { writable } from "svelte/store";
import { Character } from "./Character";

export const characters = writable([]);

export function addCharacter(name, reaction, intuition, initiativePasses, edge, woundModifiers) {
    const newCharacter = new Character(name, reaction, intuition, initiativePasses, edge, woundModifiers);
    console.log(newCharacter);
    characters.update(characters => [...characters, newCharacter]);
}

export function deleteCharacter(character) {
    characters.update(currentCharacters => currentCharacters.filter(char => char !== character));
}

export function updateCharacter(character, updates) {
    characters.update(currentCharacters => {
      const index = currentCharacters.indexOf(character);
      if (index !== -1) {
        const updatedCharacter = Object.assign(Object.create(Object.getPrototypeOf(character)), character, updates);
        currentCharacters[index] = updatedCharacter;
      }
      return currentCharacters;
    });
  }