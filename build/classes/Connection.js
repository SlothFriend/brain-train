"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const times_1 = __importDefault(require("lodash/times"));
const config_1 = __importDefault(require("../config"));
class Connection {
    constructor(neuron, 
    // Determines percentage of charge that flows through on activation
    strengthPercent = config_1.default.DEFAULT_CONNECTION_STRENGTH) {
        this.neuron = neuron;
        this.strengthPercent = strengthPercent;
    }
    mutate(times = 1) {
        times_1.default(times, () => {
            // Random amount from [-CONNECTION_MUTATION_THRESHOLD, CONNECTION_MUTATION_THRESHOLD]
            const strengthChange = (Math.random() > .5 ? 1 : -1) * (Math.random() * config_1.default.CONNECTION_MUTATION_THRESHOLD);
            this.strengthPercent += strengthChange;
        });
        // Ensure absolute strength percent doesn't go above 1
        // if (this.strengthPercent < -1) this.strengthPercent = -1
        // else if (this.strengthPercent > 1) this.strengthPercent = 1
    }
}
exports.default = Connection;
