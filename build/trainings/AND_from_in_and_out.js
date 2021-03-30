"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ANDBrain_1 = __importDefault(require("../brains/ANDBrain"));
const Brain_1 = __importDefault(require("../classes/Brain"));
const Trainer_1 = __importDefault(require("../classes/Trainer"));
const trainer = new Trainer_1.default(ANDBrain_1.default.scoreFn, [
    Brain_1.default.buildFromInAndOut(2, 1),
    Brain_1.default.buildFromInAndOut(2, 1),
    Brain_1.default.buildFromInAndOut(2, 1),
    Brain_1.default.buildFromInAndOut(2, 1),
    Brain_1.default.buildFromInAndOut(2, 1),
]);
let bestScore = 0;
let cycle = 0;
while (bestScore < 4) {
    const GENERATION_JUMP = 20;
    console.log(`Cycle: ${cycle}; Total Gens: ${cycle * GENERATION_JUMP}`);
    cycle++;
    trainer.mutateBrains(GENERATION_JUMP);
    const scores = trainer.cull();
    bestScore = Math.max(bestScore, ...scores);
}
console.log('END RESULTS');
trainer.printAllBrainDetails();
