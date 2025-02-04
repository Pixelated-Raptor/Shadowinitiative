export class Character {
    constructor(name, reaction, intuition, initiativePasses, edge, woundModifiers) {
        this.name = name;
        this.baseReaction = Number(reaction);
        this.moddedReaction = Number(reaction);
        this.baseIntuition = Number(intuition);
        this.moddedIntuition = Number(intuition);
        this.baseInitiativePasses = Number(initiativePasses);
        this.moddedInitiativePasses = Number(initiativePasses);
        this.edge = Number(edge);
        this.woundModifiers = Number(woundModifiers);

        this.isVisible = false;
    }

    getName() {return this.name;}

    getInitiative() {return this.moddedReaction + this.moddedIntuition + this.woundModifiers;}

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

    getVisibility() {return this.isVisible;}
    toggleVisibility() {this.isVisible = !this.isVisible;}
}