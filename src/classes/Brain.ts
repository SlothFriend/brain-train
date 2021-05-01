import _difference from 'lodash/difference'
import _remove from 'lodash/remove'
import _sample from 'lodash/sample'
import _times from 'lodash/times'
import { v4 as uuid } from 'uuid'
import config from '../config'
import Neuron from './Neuron'
import { BrainScoreFn } from './Trainer'
import * as fs from 'fs-extra'

export default class Brain {
  public generation: number = 0
  public id: string
  public maxProcessingMS: number = 0

  #maxNeuronFireCount: number = 4
  #neuronsToProcess: Neuron[] = []

  constructor(
    public allNeurons: Neuron[] = [],
    public inputNeurons: Neuron[] = [],
    public outputNeurons: Neuron[] = [],
  ) {
    this.id = uuid()
  }

  static build(): Brain {
    throw Error('build not implemented')
  }

  // Builds a brain with the provided input and output count
  static buildFromInAndOut (inputCount: number, outputCount: number): Brain {
    const inputNeurons = Array.from(Array(inputCount)).map(() => new Neuron())
    const outputNeurons = Array.from(Array(outputCount)).map(() => new Neuron())

    // Connect each input neuron to each output neuron
    inputNeurons.forEach(input => {
      outputNeurons.forEach(output => {
        input.connectTo(output)
      })
    })

    const allNeurons = [...inputNeurons, ...outputNeurons]
    return new this(allNeurons, inputNeurons, outputNeurons)
  }

  static loadFromFile (path: string) {
    const data = fs.readFileSync(path, { encoding: 'utf-8' }).trim()
    const lines = data.split('\n')

    const id = lines[0]
    const neuronLines = lines.slice(1)

    const allNeurons: Neuron[] = []
    const inputNeurons: Neuron[] = []
    const outputNeurons: Neuron[] = []

    // Add a neuron for each line so we have things to reference by index
    _times(neuronLines.length, () => {
      allNeurons.push(new Neuron())
    })

    // Create connections between the neurons and record input/output status
    neuronLines.forEach((line, i) => {
      const neuron = allNeurons[i]

      const [connStr, type] = line.split(' ')
      const connData: any = JSON.parse(connStr)
      connData.forEach(([connectToIndex, strength]) => {
        neuron.connectTo(allNeurons[connectToIndex], strength)
      })

      if (type === 'in') inputNeurons.push(neuron)
      else if (type === 'out') outputNeurons.push(neuron)
    })

    const brain: Brain = new this(allNeurons, inputNeurons, outputNeurons)
    brain.id = id
    return brain
  }

  static scoreFn: BrainScoreFn = (brain: Brain, printResults = false) => {
    throw Error('scoreFn not implemented')
  }

  static test (brain: Brain) {
    console.log('Score is:', this.scoreFn(brain))
  }

  get connectionCount(): number {
    return this.allNeurons.reduce((total, neuron) => {
      return total + neuron.connections.length
    }, 0)
  }

  // Brain cost is a measure of negative factors independent of performance (like neuron count, or processing time)
  get cost(): number {
    const { COST_FACTORS } = config
    return COST_FACTORS.neurons * this.neuronCount
      + COST_FACTORS.connections * this.connectionCount
      + COST_FACTORS.processingMS * this.maxProcessingMS
  }

  get neuronCount(): number {
    return this.allNeurons.length
  }

  // Note: This may not add a connection if the neuron selected to form a new connection is already maximally connected
  private addRandomConnection () {
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

  private addRandomNeuron () {
    // Make the new neuron's input a non-output neuron and its output a non-input neuron
    const n = new Neuron()
    const nonOutputNeuron = _sample(_difference(this.allNeurons, this.outputNeurons))
    const nonInputNeuron = _sample(_difference(this.allNeurons, this.inputNeurons))
    nonOutputNeuron.connectTo(n)
    n.connectTo(nonInputNeuron)
    this.allNeurons.push(n)
  }

  /**
   * Returns a boolean array of whether each output neuron fired
   */
  private getOutput (): boolean[] {
    return this.outputNeurons.map(n => n.fireCount > 0)
  }

  private mutateConnections (times: number = 1) {
    _times(times, () => {
      // If we should mutate a connection
      if (Math.random() < config.CONNECTION_ADD_SUB_CHANCE) {
        if (Math.random() < config.CONNECTION_ADD_SUB_CHANCE_TO_ADD) {
          this.addRandomConnection()
        } else {
          this.removeRandomConnection()
        }
      }
    })
  }

  private mutateNeuronCount (times: number = 1) {
    _times(times, () => {
      // If we should add/sum a neuron
      if (Math.random() < config.NEURON_ADD_SUB_CHANCE) {
        if (Math.random() < config.NEURON_ADD_SUB_CHANCE_TO_ADD) {
          this.addRandomNeuron()
        } else {
          this.removeRandomNeuron()
        }
      }
    })
  }

  private mutateNeurons (times: number = 1) {
    this.allNeurons.forEach(neuron => { neuron.mutate(times) })
  }

  private processNeurons () {
    const startTime = new Date().getTime()
    while (this.#neuronsToProcess.length) {
      const neuronToProcess = this.#neuronsToProcess.shift()
      if (neuronToProcess.chargePercent >= 1) {
        this.#neuronsToProcess.push(...neuronToProcess.fire(this.#maxNeuronFireCount))
      }
      if (new Date().getTime() - startTime > config.MAX_PROCESSING_MS) {
        console.log('MAX PROCESSING TIME: aborting')
        return
      }
    }
  }

  private removeRandomConnection () {
    // Pick a non-output neuron (they don't have connections)
    const nonOutputNeuron = _sample(_difference(this.allNeurons, this.outputNeurons))
    const connectionToRemove = _sample(nonOutputNeuron.connections)
    _remove(nonOutputNeuron.connections, c => c === connectionToRemove)
  }

  private removeRandomNeuron () {
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

  copy (options = { withId: false }): Brain {
    // Create a new array with all new neurons, no connections
    const newAllNeurons = this.allNeurons.map(() => new Neuron())

    newAllNeurons.forEach((newNeuron, i) => {
      // Fill out the new neuron's connections based on the existing neuron's (by index order)
      const originalNeuron = this.allNeurons[i]
      originalNeuron.connections.forEach(originalConnection => {
        const index = this.allNeurons.indexOf(originalConnection.neuron)
        newNeuron.connectTo(newAllNeurons[index], originalConnection.strengthPercent)
      })
    })

    // Add to input and output lists by correlated lookup
    const newInputNeurons = this.inputNeurons.map(originalInputNeuron => {
      const index = this.allNeurons.indexOf(originalInputNeuron)
      return newAllNeurons[index]
    })
    const newOutputNeurons = this.outputNeurons.map(originalOutputNeuron => {
      const index = this.allNeurons.indexOf(originalOutputNeuron)
      return newAllNeurons[index]
    })

    const newBrain = new (this.constructor as typeof Brain)(newAllNeurons, newInputNeurons, newOutputNeurons)
    newBrain.generation = this.generation
    if (options.withId) newBrain.id = this.id
    return newBrain
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

  printDetails () {
    console.log(`Brain ID: ${this.id}`)
    console.log(`Generation: ${this.generation}`)
    console.log(`Neuron Count: ${this.neuronCount}`)
    console.log(`Connection Count: ${this.connectionCount}`)
    console.log(`Max Processing Time (ms): ${this.maxProcessingMS}`)
    console.log()
  }

  /**
   * Takes input for each input neuron and returns output for each output neuron
   */
  processInput (input: boolean[]): boolean[] {
    if (input.length !== this.inputNeurons.length) {
      throw Error('Invalid Input: Input length must be same size as input neuron list')
    }

    const startTime = new Date().getTime()

    input.forEach((val, i) => {
      if (val === true) {
        this.inputNeurons[i].charge(1)
        this.#neuronsToProcess.push(this.inputNeurons[i])
      }
    })

    this.processNeurons()
    const output = this.getOutput()

    const endTime = new Date().getTime()
    const processingMS = endTime - startTime
    if (this.maxProcessingMS < processingMS) this.maxProcessingMS = processingMS

    return output
  }

  reset () {
    this.allNeurons.forEach(n => n.reset())
  }

  saveToFile () {
    // For each neuron, save its connections
    let data = this.id + '\n'
    this.allNeurons.forEach((neuron, i) => {
      data += JSON.stringify(neuron.connections.map(connection => {
        const neuronIndex = this.allNeurons.indexOf(connection.neuron)
        const strength = connection.strengthPercent
        return [neuronIndex, strength]
      }))
      if (this.inputNeurons.includes(neuron)) data += ' in'
      else if (this.outputNeurons.includes(neuron)) data += ' out'
      data += '\n'
    })
    const path = `./saved-brains/${this.id}.brain`
    fs.outputFileSync(path, data)
    console.log(`Brain saved to path: "${path}"`)
  }
}
