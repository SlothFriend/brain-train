import _difference from 'lodash/difference'
import _remove from 'lodash/remove'
import _sample from 'lodash/sample'
import _times from 'lodash/times'
import { v4 as uuid } from 'uuid'
import config from '../config'
import Neuron from './Neuron'

export default class Brain {
  public generation: number = 0
  public id: string
  public maxNeuronFireCount?: number
  public neuronsToProcess: Neuron[] = []

  constructor(
    public allNeurons: Neuron[],
    public inputNeurons: Neuron[],
    public outputNeurons: Neuron[]
  ) {
    this.id = uuid()
  }

  // Note: This may not add a connection if the neuron selected to form a new connection is already maximally connected
  addConnection () {
    // Pick a non-output neuron to connect to a different non-input neuron
    const nonOutputNeuron = _sample(_difference(this.allNeurons, this.outputNeurons))
    const otherNonInputNonConnectedNeuron = _sample(_difference(
      this.allNeurons,
      this.inputNeurons,
      [nonOutputNeuron], // Don't try to connect to yourself
      nonOutputNeuron.connections.map(c => c.neuron), // Don't try to connect to something you're already connected to
    ))
    if (nonOutputNeuron && otherNonInputNonConnectedNeuron) {
      nonOutputNeuron.connectTo(otherNonInputNonConnectedNeuron)
    }
  }

  addNeuron () {
    // Make the new neuron's input a non-output neuron and its output a non-input neuron
    const n = new Neuron()
    const nonOutputNeuron = _sample(_difference(this.allNeurons, this.outputNeurons))
    const nonInputNeuron = _sample(_difference(this.allNeurons, this.inputNeurons))
    nonOutputNeuron.connectTo(n)
    n.connectTo(nonInputNeuron)
    this.allNeurons.push(n)
  }

  getOutput (): number[] {
    return this.outputNeurons.map(n => n.fireCount)
  }

  mutate (times: number = 1) {
    // Add or subtract a neuron
    this.mutateNeuronCount(times)

    // Add or subtract a connection between neurons
    this.mutateConnections(times)

    // Mutate neurons
    this.mutateNeurons(times)

    // Update generation
    this.generation += times
  }

  mutateConnections (times: number = 1) {
    _times(times, () => {
      // If we should mutate a connection
      if (Math.random() < config.CONNECTION_ADD_SUB_CHANCE) {
        if (Math.random() < config.CONNECTION_ADD_SUB_CHANCE_TO_ADD) {
          this.addConnection()
        } else {
          this.removeConnection()
        }
      }
    })
  }

  mutateNeuronCount (times: number = 1) {
    _times(times, () => {
      // If we should add/sum a neuron
      if (Math.random() < config.NEURON_ADD_SUB_CHANCE) {
        if (Math.random() < config.NEURON_ADD_SUB_CHANCE_TO_ADD) {
          this.addNeuron()
        } else {
          this.removeNeuron()
        }
      }
    })
  }

  mutateNeurons (times: number = 1) {
    this.allNeurons.forEach(neuron => { neuron.mutate(times) })
  }

  printDetails () {
    const connectionStregths = this.allNeurons.map(n => n.connections.map(c => c.strengthPercent)).flat()
    const conStrengthsString = connectionStregths.map((s: number) => `\n${s.toFixed(4)}`)
    console.log(`Brain ID: ${this.id}\nGeneration: ${this.generation}\nConnection Strengths: ${conStrengthsString}`)
    console.log()
  }

  processInput (input: boolean[]): number[] {
    if (input.length !== this.inputNeurons.length) {
      throw Error('Invalid Input: Input length must be same size as input neuron list')
    }

    input.forEach((val, i) => {
      if (val) {
        this.inputNeurons[i].charge(1)
        this.neuronsToProcess.push(this.inputNeurons[i])
      }
    })

    this.processNeurons()

    return this.getOutput()
  }

  processNeurons () {
    while (this.neuronsToProcess.length) {
      const neuronToProcess = this.neuronsToProcess.shift()
      if (neuronToProcess.chargePercent >= 1) {
        this.neuronsToProcess.push(...neuronToProcess.fire(this.maxNeuronFireCount))
      }
    }
  }

  // Kill a random connection
  removeConnection () {
    // Pick a non-output neuron (they don't have connections)
    const nonOutputNeuron = _sample(_difference(this.allNeurons, this.outputNeurons))
    const connectionToRemove = _sample(nonOutputNeuron.connections)
    _remove(nonOutputNeuron.connections, c => c === connectionToRemove)
  }

  removeNeuron () {
    // Pick a non-input, non-output neuron to remove
    const neuronToRemove = _sample(_difference(this.allNeurons, this.inputNeurons, this.outputNeurons))
    if (neuronToRemove) {
      // Remove all connections to this neuron
      this.allNeurons.forEach(n => {
        _remove(n.connections, c => c.neuron === neuronToRemove)
      })

      // Remove from allNeurons
      _remove(this.allNeurons, n => n === neuronToRemove)
    }
  }

  reset () {
    this.allNeurons.forEach(n => n.reset())
  }
}
