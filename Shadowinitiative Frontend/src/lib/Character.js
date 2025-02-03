export class Character {
    //Typenprüfung im Eingabeformular durchführen!
    constructor(name, initiative, initiativePasses, reaction, intuition, edge, woundModifiers) {
        this.name = name;
        this.baseInitiative = initiative;
        this.moddedInitiative = initiative;
        this.baseInitiativePasses = initiativePasses;
        this.moddedInitiativePasses = initiativePasses;
        this.baseReaction = reaction;
        this.moddedReaction = reaction;
        this.baseIntuition = intuition;
        this.moddedIntuition = intuition;
        this.edge = edge;
        this.woundModifiers = woundModifiers;
    }

    getName() {return this.name;}

    getBaseInitiative() {return this.baseInitiative;}

    getModdedInitiative() {return this.moddedInitiative;}
    setModdedInitiative(newInitiative) {this.moddedInitiative = newInitiative;}

    getBaseInitiativePasses() {return this.baseInitiativePasses;}

    getModdedInitiativePasses() {return this.moddedInitiativePasses;}
    setModdedInitiativePasses(newInitiativePasses) {this.moddedInitiativePasses = newInitiativePasses;}

    getBaseReaction() {return this.baseReaction;}

    getModdedReaction() {return this.moddedReaction;}
    setModdedReaction(newReaction) {this.moddedReaction = newReaction;}

    getBaseIntuition() {return this.baseIntuition;}

    getModdedIntuition() {return this.moddedIntuition;}
    setModdedIntuition(newIntuition) {this.moddedIntuition = newIntuition;}

    getEdge() {return this.edge;}

    getWoundModifiers() {return this.woundModifiers;}
    setWoundModifiers(newWoundModifiers) {this.woundModifiers = newWoundModifiers;}
}