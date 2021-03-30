"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _maxNeuronFireCount, _neuronsToProcess;
Object.defineProperty(exports, "__esModule", { value: true });
const difference_1 = __importDefault(require("lodash/difference"));
const remove_1 = __importDefault(require("lodash/remove"));
const sample_1 = __importDefault(require("lodash/sample"));
const times_1 = __importDefault(require("lodash/times"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config"));
const Neuron_1 = __importDefault(require("./Neuron"));
class Brain {
    constructor(allNeurons = [], inputNeurons = [], outputNeurons = []) {
        this.allNeurons = allNeurons;
        this.inputNeurons = inputNeurons;
        this.outputNeurons = outputNeurons;
        this.generation = 0;
        _maxNeuronFireCount.set(this, 10);
        _neuronsToProcess.set(this, []);
        this.id = uuid_1.v4();
    }
    // Builds a brain with the provided input and output count
    static buildFromInAndOut(inputCount, outputCount) {
        const inputNeurons = Array.from(Array(inputCount)).map(() => new Neuron_1.default());
        const outputNeurons = Array.from(Array(outputCount)).map(() => new Neuron_1.default());
        // Connect each input neuron to each output neuron
        inputNeurons.forEach(input => {
            outputNeurons.forEach(output => {
                input.connectTo(output);
            });
        });
        const allNeurons = [...inputNeurons, ...outputNeurons];
        return new this(allNeurons, inputNeurons, outputNeurons);
    }
    // Note: This may not add a connection if the neuron selected to form a new connection is already maximally connected
    addRandomConnection() {
        // Pick a non-output neuron to connect to a different non-input neuron
        const nonOutputNeuron = sample_1.default(difference_1.default(this.allNeurons, this.outputNeurons));
        const otherNonInputNonConnectedNeuron = sample_1.default(difference_1.default(this.allNeurons, this.inputNeurons, [nonOutputNeuron], // Don't try to connect to yourself
        nonOutputNeuron.connections.map(c => c.neuron)));
        if (nonOutputNeuron && otherNonInputNonConnectedNeuron) {
            nonOutputNeuron.connectTo(otherNonInputNonConnectedNeuron);
        }
    }
    addRandomNeuron() {
        // Make the new neuron's input a non-output neuron and its output a non-input neuron
        const n = new Neuron_1.default();
        const nonOutputNeuron = sample_1.default(difference_1.default(this.allNeurons, this.outputNeurons));
        const nonInputNeuron = sample_1.default(difference_1.default(this.allNeurons, this.inputNeurons));
        nonOutputNeuron.connectTo(n);
        n.connectTo(nonInputNeuron);
        this.allNeurons.push(n);
    }
    /**
     * Returns a boolean array of whether each output neuron fired
     */
    getOutput() {
        return this.outputNeurons.map(n => n.fireCount > 0);
    }
    mutateConnections(times = 1) {
        times_1.default(times, () => {
            // If we should mutate a connection
            if (Math.random() < config_1.default.CONNECTION_ADD_SUB_CHANCE) {
                if (Math.random() < config_1.default.CONNECTION_ADD_SUB_CHANCE_TO_ADD) {
                    this.addRandomConnection();
                }
                else {
                    this.removeRandomConnection();
                }
            }
        });
    }
    mutateNeuronCount(times = 1) {
        times_1.default(times, () => {
            // If we should add/sum a neuron
            if (Math.random() < config_1.default.NEURON_ADD_SUB_CHANCE) {
                if (Math.random() < config_1.default.NEURON_ADD_SUB_CHANCE_TO_ADD) {
                    this.addRandomNeuron();
                }
                else {
                    this.removeRandomNeuron();
                }
            }
        });
    }
    mutateNeurons(times = 1) {
        this.allNeurons.forEach(neuron => { neuron.mutate(times); });
    }
    processNeurons() {
        while (__classPrivateFieldGet(this, _neuronsToProcess).length) {
            const neuronToProcess = __classPrivateFieldGet(this, _neuronsToProcess).shift();
            if (neuronToProcess.chargePercent >= 1) {
                __classPrivateFieldGet(this, _neuronsToProcess).push(...neuronToProcess.fire(__classPrivateFieldGet(this, _maxNeuronFireCount)));
            }
        }
    }
    removeRandomConnection() {
        // Pick a non-output neuron (they don't have connections)
        const nonOutputNeuron = sample_1.default(difference_1.default(this.allNeurons, this.outputNeurons));
        const connectionToRemove = sample_1.default(nonOutputNeuron.connections);
        remove_1.default(nonOutputNeuron.connections, c => c === connectionToRemove);
    }
    removeRandomNeuron() {
        // Pick a non-input, non-output neuron to remove
        const neuronToRemove = sample_1.default(difference_1.default(this.allNeurons, this.inputNeurons, this.outputNeurons));
        if (neuronToRemove) {
            // Remove all connections to this neuron
            this.allNeurons.forEach(n => {
                remove_1.default(n.connections, c => c.neuron === neuronToRemove);
            });
            // Remove from allNeurons
            remove_1.default(this.allNeurons, n => n === neuronToRemove);
        }
    }
    copy() {
        // Create a new array with all new neurons, no connections
        const newAllNeurons = this.allNeurons.map(() => new Neuron_1.default());
        newAllNeurons.forEach((newNeuron, i) => {
            // Fill out the new neuron's connections based on the existing neuron's (by index order)
            const originalNeuron = this.allNeurons[i];
            originalNeuron.connections.forEach(originalConnection => {
                const index = this.allNeurons.indexOf(originalConnection.neuron);
                newNeuron.connectTo(newAllNeurons[index], originalConnection.strengthPercent);
            });
        });
        // Add to input and output lists by correlated lookup
        const newInputNeurons = this.inputNeurons.map(originalInputNeuron => {
            const index = this.allNeurons.indexOf(originalInputNeuron);
            return newAllNeurons[index];
        });
        const newOutputNeurons = this.outputNeurons.map(originalOutputNeuron => {
            const index = this.allNeurons.indexOf(originalOutputNeuron);
            return newAllNeurons[index];
        });
        const newBrain = new this.constructor(newAllNeurons, newInputNeurons, newOutputNeurons);
        newBrain.generation = this.generation;
        return newBrain;
    }
    mutate(times = 1) {
        // Add or subtract a neuron
        this.mutateNeuronCount(times);
        // Add or subtract a connection between neurons
        this.mutateConnections(times);
        // Mutate neurons
        this.mutateNeurons(times);
        // Update generation
        this.generation += times;
    }
    printDetails() {
        const neuronCount = this.allNeurons.length;
        const connectionCount = this.allNeurons.reduce((total, neuron) => {
            return total + neuron.connections.length;
        }, 0);
        console.log(`Brain ID: ${this.id}\nGeneration: ${this.generation}\nNeuron Count: ${neuronCount}\nConnection Count: ${connectionCount}`);
        console.log();
    }
    /**
     * Takes input for each input neuron and returns output for each output neuron
     */
    processInput(input) {
        if (input.length !== this.inputNeurons.length) {
            throw Error('Invalid Input: Input length must be same size as input neuron list');
        }
        input.forEach((val, i) => {
            if (val === true) {
                this.inputNeurons[i].charge(1);
                __classPrivateFieldGet(this, _neuronsToProcess).push(this.inputNeurons[i]);
            }
        });
        this.processNeurons();
        return this.getOutput();
    }
    reset() {
        this.allNeurons.forEach(n => n.reset());
    }
}
exports.default = Brain;
_maxNeuronFireCount = new WeakMap(), _neuronsToProcess = new WeakMap();
