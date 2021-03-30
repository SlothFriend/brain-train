"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Connection_1 = __importDefault(require("./Connection"));
class Neuron {
    constructor() {
        // 0-1+ which determines firing (2 = 2 firings)
        this.chargePercent = 0;
        this.connections = [];
        this.fireCount = 0;
    }
    charge(chargePercent) {
        this.chargePercent += chargePercent;
    }
    connectTo(neuron, strengthPercent) {
        // Add the connection if it's not already a connection
        if (!this.connections.map(c => c.neuron).includes(neuron)) {
            this.connections.push(new Connection_1.default(neuron, strengthPercent));
        }
    }
    // Transfers charge to connections and returns connected neurons for further processing
    fire(maxFireCount) {
        if (maxFireCount && this.fireCount > maxFireCount)
            return []; //throw Error('Max fire count reached.')
        while (this.chargePercent >= 1) {
            this.connections.forEach(({ neuron: connectedNeuron, strengthPercent }) => {
                connectedNeuron.charge(strengthPercent);
            });
            this.chargePercent -= 1;
            this.fireCount++;
        }
        return this.connections.map(c => c.neuron);
    }
    mutate(times = 1) {
        this.connections.forEach(connection => { connection.mutate(times); });
    }
    reset() {
        this.chargePercent = 0;
        this.fireCount = 0;
    }
}
exports.default = Neuron;
