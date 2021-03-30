"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FourBitAdder_1 = __importDefault(require("../brains/FourBitAdder"));
const Trainer_1 = __importDefault(require("../classes/Trainer"));
const trainer = new Trainer_1.default(FourBitAdder_1.default.scoreFn, [
    FourBitAdder_1.default.build(),
    FourBitAdder_1.default.build(),
    FourBitAdder_1.default.build(),
    FourBitAdder_1.default.build(),
    FourBitAdder_1.default.build(),
]);
let bestScore = 0;
let cycle = 0;
while (bestScore < FourBitAdder_1.default.topScore) {
    const GENERATION_JUMP = 1000;
    console.log(`Cycle: ${cycle}; Total Gens: ${cycle * GENERATION_JUMP}`);
    cycle++;
    console.log('Mutating...');
    trainer.mutateBrains(GENERATION_JUMP);
    console.log('Culling...');
    const scores = trainer.cull();
    bestScore = Math.max(bestScore, ...scores);
}
console.log('END RESULTS');
trainer.printAllBrainDetails();
