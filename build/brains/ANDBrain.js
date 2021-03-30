"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
let ANDBrain = /** @class */ (() => {
    class ANDBrain extends classes_1.Brain {
        constructor(allNeurons = [], inputNeurons = [], outputNeurons = []) {
            super(allNeurons, inputNeurons, outputNeurons);
            this.allNeurons = allNeurons;
            this.inputNeurons = inputNeurons;
            this.outputNeurons = outputNeurons;
            if (!this.allNeurons.length) {
                const input1 = new classes_1.Neuron();
                const input2 = new classes_1.Neuron();
                const output = new classes_1.Neuron();
                input1.connectTo(output);
                input2.connectTo(output);
                this.allNeurons = [input1, input2, output];
                this.inputNeurons = [input1, input2];
                this.outputNeurons = [output];
            }
        }
    }
    ANDBrain.scoreFn = (brain) => {
        let score = 0;
        // 0, 0 = 0
        brain.reset();
        const [andVal1] = brain.processInput([false, false]);
        if (!andVal1)
            score++;
        // 0, 1 = 0
        brain.reset();
        const [andVal2] = brain.processInput([false, true]);
        if (!andVal2)
            score++;
        // 1, 0 = 0
        brain.reset();
        const [andVal3] = brain.processInput([true, false]);
        if (!andVal3)
            score++;
        // 1, 1 = 1
        brain.reset();
        const [andVal4] = brain.processInput([true, true]);
        if (andVal4)
            score++;
        return score;
    };
    return ANDBrain;
})();
exports.default = ANDBrain;
