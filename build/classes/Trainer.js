"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sample_1 = __importDefault(require("lodash/sample"));
class Trainer {
    constructor(brainScorer, brains) {
        this.brainScorer = brainScorer;
        this.brains = brains;
    }
    // Keep the higher-scoring brains, replace the lower-scoring
    cull() {
        // Lower third gets replaced
        const scores = this.getScores();
        console.log('scores:', scores);
        const idsWithScores = scores.map((score, i) => ({ id: this.brains[i].id, index: i, score }));
        idsWithScores.sort((a, b) => a.score > b.score ? -1 : 1); // Sorted by best first
        // Print results
        console.log();
        console.log('Sorted brains by score: ');
        console.log();
        idsWithScores.forEach(({ index, score }) => {
            console.log('Score:', score);
            this.brains[index].printDetails();
        });
        const topScore = idsWithScores[0].score;
        // Get the top third that have the top score
        const topScoringBrains = idsWithScores
            .slice(0, Math.round(idsWithScores.length / 3))
            .filter(x => x.score === topScore)
            .map(({ id }) => this.brains.find(b => b.id === id));
        // Get the bottom third
        const toReplace = idsWithScores.slice(idsWithScores.length - Math.round(idsWithScores.length / 3));
        toReplace.forEach(({ id }) => {
            const index = this.brains.findIndex(b => b.id === id);
            // Replace the brain with a copy of one of the best scoring brains
            this.brains[index] = sample_1.default(topScoringBrains).copy();
        });
        // Log best performing brain
        const { index, score } = idsWithScores[0];
        console.log('Best Brain:');
        console.log('Score:', score);
        this.brains[index].printDetails();
        return scores;
    }
    getScores() {
        this.resetBrains();
        return this.brains.map(brain => this.brainScorer(brain));
    }
    mutateBrains(times = 1) {
        this.brains.forEach(brain => brain.mutate(times));
    }
    printAllBrainDetails() {
        console.log();
        this.brains.forEach(b => b.printDetails());
        console.log();
    }
    resetBrains() {
        this.brains.forEach(brain => brain.reset());
    }
}
exports.default = Trainer;
