export class Character {
    constructor(name, reaction, intuition, initiativePasses, edge, woundModifiers) {
        this.name = name;

        this.baseReaction = Number(reaction);
        this.moddedReaction = null;

        this.baseIntuition = Number(intuition);
        this.moddedIntuition = null;

        this.baseInitiativePasses = Number(initiativePasses);
        this.moddedInitiativePasses = null;

        this.edge = Number(edge);

        this.woundModifiers = Number(woundModifiers);

        this.isVisible = false;
    }

    getName() {return this.name;}

    getInitiative() {return this.baseReaction + this.baseIntuition + this.woundModifiers;}
    getModdedInitiative() {return this.moddedReaction + this.moddedIntuition + this.woundModifiers;}

    getBaseInitiativePasses() {return this.baseInitiativePasses;}
    setBaseInitiativePasses(newInitiativePasses) {this.baseInitiativePasses = newInitiativePasses;}

    getModdedInitiativePasses() {return this.moddedInitiativePasses;}
    setModdedInitiativePasses(newInitiativePasses) {this.moddedInitiativePasses = newInitiativePasses;}

    getBaseReaction() {return this.baseReaction;}
    setBaseReaction(newReaction) {this.baseReaction = newReaction;}

    getModdedReaction() {return this.moddedReaction;}
    setModdedReaction(newReaction) {this.moddedReaction = newReaction;}

    getBaseIntuition() {return this.baseIntuition;}
    setBaseIntuition(newIntuition) {this.baseIntuition = newIntuition;}

    getModdedIntuition() {return this.moddedIntuition;}
    setModdedIntuition(newIntuition) {this.moddedIntuition = newIntuition;}

    getEdge() {return this.edge;}
    setEdge(newEdge) {this.edge = newEdge;}

    getWoundModifiers() {return this.woundModifiers;}
    setWoundModifiers(newWoundModifiers) {this.woundModifiers = newWoundModifiers;}

    getVisibility() {return this.isVisible;}
    toggleVisibility() {this.isVisible = !this.isVisible;}
}