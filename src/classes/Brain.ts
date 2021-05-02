import * as fs from 'fs-extra'
import _difference from 'lodash/difference'
import _remove from 'lodash/remove'
import _sample from 'lodash/sample'
import _times from 'lodash/times'
import { v4 as uuid } from 'uuid'
import config from '../config'
import Neuron from './Neuron'
import { BrainScoreFn } from './Trainer'

export default class Brain {
  static subBrainTypes: (typeof Brain)[] = []

  public generation: number = 0
  public id: string
  public maxProcessingMS: number = 0

  #maxNeuronFireCount: number = 4
  #neuronsToProcess: Neuron[] = []
  #subBrains: Brain[] = []

  constructor(
    public allNeurons: Neuron[] = [],
    public inputNeurons: Neuron[] = [],
    public outputNeurons: Neuron[] = [],
  ) {
    this.id = uuid()
  }

  static build(): Brain {
    throw Error('"build" not implemented for base Brain')
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

  static loadFromFile (path?: string) {
    if (path == null) throw Error('Path is needed for base Brain "loadFromFile"')

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

  get allNeuronsIncludingSubBrains(): Neuron[] {
    const allCurrentNeurons = [...this.allNeurons]
    this.#subBrains.forEach(subBrain => allCurrentNeurons.push(...subBrain.allNeurons))
    return allCurrentNeurons
  }

  get connectFromCandidateNeurons(): Neuron[] {
    // Non-output neurons and sub-brain outputs can form new connections
    const subBrainOutputNeurons: Neuron[] = this.#subBrains.reduce((outputNeurons, subBrain) => {
      outputNeurons.push(...subBrain.outputNeurons)
      return outputNeurons
    }, [])
    return [...this.nonOutputNeurons, ...subBrainOutputNeurons]
  }

  get connectToCondidateNeurons(): Neuron[] {
    // Non-input neurons and sub-brain inputs can receive new connections
    const subBrainInputNeurons: Neuron[] = this.#subBrains.reduce((inputNeurons, subBrain) => {
      inputNeurons.push(...subBrain.inputNeurons)
      return inputNeurons
    }, [])
    return [...this.nonInputNeurons, ...subBrainInputNeurons]
  }

  get connectionCount(): number {
    return this.allNeuronsIncludingSubBrains.reduce((count, neuron) => {
      return count + neuron.connections.length
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
    return this.allNeurons.length + this.#subBrains.reduce((count, subBrain) => count + subBrain.allNeurons.length, 0)
  }

  get nonInputNeurons(): Neuron[] {
    return _difference(this.allNeurons, this.inputNeurons)
  }

  get nonOutputNeurons(): Neuron[] {
    return _difference(this.allNeurons, this.outputNeurons)
  }

  get nonInputOutputNeurons(): Neuron[] {
    return _difference(this.allNeurons, this.inputNeurons, this.outputNeurons)
  }

  get subBrainTypes(): (typeof Brain)[] {
    return (this.constructor as typeof Brain).subBrainTypes
  }

  private addRandomSubBrain () {
    const subBrainType = _sample(this.subBrainTypes)
    const subBrain = subBrainType.loadFromFile()

    // Connect subBrain inputs
    const connectFromNeurons = this.connectFromCandidateNeurons
    subBrain.inputNeurons.forEach(inputNeuron => {
      const nonOutputNeuron = _sample(connectFromNeurons)
      nonOutputNeuron.connectTo(inputNeuron)
    })

    // Connect subBrains outputs
    const connectToNeurons = this.connectToCondidateNeurons
    subBrain.outputNeurons.forEach(outputNeuron => {
      const nonInputNueron = _sample(connectToNeurons)
      outputNeuron.connectTo(nonInputNueron)
    })

    this.#subBrains.push(subBrain)
  }

  private addRandomConnection () {
    // Select a neuron to connect FROM
    const candidateFromNeurons = this.connectFromCandidateNeurons
    if (candidateFromNeurons.length === 0) return
    const neuronToConnectFrom = _sample(candidateFromNeurons)

    // Select a neuron to connect TO
    const candidateToNeurons = _difference(
      this.connectToCondidateNeurons,
      [neuronToConnectFrom], // Don't connect to yourself
      neuronToConnectFrom.connections.map(c => c.neuron), // Don't connect to something you're already connected to
    )
    if (candidateToNeurons.length === 0) return
    const neuronToConnectTo = _sample(candidateToNeurons)

    neuronToConnectFrom.connectTo(neuronToConnectTo)
  }

  private addRandomNeuron () {
    const newNeuron = new Neuron()
    const connectFromNeurons = this.connectFromCandidateNeurons
    const connectFromNeuron = _sample(connectFromNeurons)
    const connectToNeuron = _sample(this.connectToCondidateNeurons)
    connectFromNeuron.connectTo(newNeuron)
    newNeuron.connectTo(connectToNeuron)
    this.allNeurons.push(newNeuron)
  }

  /** Returns a boolean array of whether each output neuron fired */
  private getOutput (): boolean[] {
    return this.outputNeurons.map(n => n.fireCount > 0)
  }

  private mutateAddRemoveSubBrains (times = 1) {
    _times(times, () => {
      // If we should mutate a sub-brain
      if (Math.random() < config.BRAIN_ADD_SUB_CHANCE) {
        if (Math.random() < config.BRAIN_ADD_SUB_CHANCE_TO_ADD) {
          this.addRandomSubBrain()
        } else {
          this.removeRandomSubBrain()
        }
      }
    })
  }

  private mutateAddRemoveConnections (times = 1) {
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

  private mutateAddRemoveNeurons (times = 1) {
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

  private mutateConnectionStrengths (times = 1) {
    // Don't mutate sub-brain connections
    this.allNeurons.forEach(neuron => { neuron.mutate(times) })
  }

  private processNeurons () {
    const startTime = new Date().getTime()
    while (this.#neuronsToProcess.length) {
      const neuronToProcess = this.#neuronsToProcess.pop()
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
    const neuron = _sample(this.connectFromCandidateNeurons)
    const connectionToRemove = _sample(neuron.connections)
    _remove(neuron.connections, c => c === connectionToRemove)
  }

  private removeRandomNeuron () {
    // Pick a non-input, non-output neuron to remove
    const nonInputOutputNeurons = this.nonInputOutputNeurons
    if (nonInputOutputNeurons.length === 0) return

    const neuronToRemove = _sample(nonInputOutputNeurons)
    // Remove all connections TO this neuron
    this.connectFromCandidateNeurons.forEach(n => {
      _remove(n.connections, c => c.neuron === neuronToRemove)
    })
    // Remove from allNeurons
    _remove(this.allNeurons, n => n === neuronToRemove)
  }

  private removeRandomSubBrain () {
    if (this.#subBrains.length === 0) return

    const subBrainToRemove = _sample(this.#subBrains)
    // Remove all connections TO the brain
    subBrainToRemove.inputNeurons.forEach(inputNeuron => {
      this.connectFromCandidateNeurons.forEach(n => {
        _remove(n.connections, c => c.neuron === inputNeuron)
      })
    })
    // Remove from subBrains
    _remove(this.#subBrains, b => b === subBrainToRemove)
  }

  copy (options = { withId: false }): Brain {
    // Create a new array with all new neurons, no connections
    const allCurrentNeurons = this.allNeuronsIncludingSubBrains
    const newNeurons = allCurrentNeurons.map(() => new Neuron())

    newNeurons.forEach((newNeuron, i) => {
      // Fill out the new neuron's connections based on the existing neuron's (by index order)
      const originalNeuron = allCurrentNeurons[i]
      originalNeuron.connections.forEach(originalConnection => {
        const index = allCurrentNeurons.indexOf(originalConnection.neuron)
        newNeuron.connectTo(newNeurons[index], originalConnection.strengthPercent)
      })
    })

    // Add to input and output lists by correlated lookup
    const newInputNeurons = this.inputNeurons.map(originalInputNeuron => {
      const index = allCurrentNeurons.indexOf(originalInputNeuron)
      return newNeurons[index]
    })
    const newOutputNeurons = this.outputNeurons.map(originalOutputNeuron => {
      const index = allCurrentNeurons.indexOf(originalOutputNeuron)
      return newNeurons[index]
    })

    const newBrain = new (this.constructor as typeof Brain)(newNeurons, newInputNeurons, newOutputNeurons)
    newBrain.generation = this.generation
    if (options.withId) newBrain.id = this.id
    return newBrain
  }

  mutate (times: number = 1) {
    // Add or subtract a sub-brain
    if (this.subBrainTypes.length > 0) {
      this.mutateAddRemoveSubBrains(times)
    }

    // Add or subtract a neuron
    this.mutateAddRemoveNeurons(times)

    // Add or subtract a connection between neurons
    this.mutateAddRemoveConnections(times)

    // Mutate neurons
    this.mutateConnectionStrengths(times)

    // Update generation
    this.generation += times
  }

  printDetails () {
    console.log(`Brain ID: ${this.id}`)
    console.log(`Generation: ${this.generation}`)
    console.log(`Sub-Brain Count: ${this.#subBrains.length}`)
    console.log(`Neuron Count: ${this.neuronCount}`)
    console.log(`Connection Count: ${this.connectionCount}`)
    console.log(`Max Processing Time (ms): ${this.maxProcessingMS}`)
    this.printSubBrainDetails()
    console.log()
  }

  printSubBrainDetails() {
    if (this.subBrainTypes.length === 0) return
    console.log('Sub-Brains:')
    this.subBrainTypes.forEach(brainType => {
      const count = this.#subBrains.filter(brain => brain instanceof brainType).length
      console.log(`  - ${brainType.name}: ${count}`)
    })
  }

  /** Takes input for each input neuron and returns output for each output neuron */
  processInput (inputVals: boolean[]): boolean[] {
    if (inputVals.length !== this.inputNeurons.length) throw Error('Invalid Input: Input length must be same size as input neuron list')

    const startTime = new Date().getTime()

    inputVals.forEach((val, i) => {
      if (val === true) {
        this.inputNeurons[i].charge()
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
    this.#subBrains.forEach(b => b.reset())
  }

  saveToFile () {
    let data = this.id + '\n'
    const neurons = this.allNeuronsIncludingSubBrains
    const inputNeurons = this.inputNeurons
    const outputNeurons = this.outputNeurons
    // For each neuron, save its connections
    neurons.forEach(neuron => {
      data += JSON.stringify(neuron.connections.map(connection => {
        // Connection stored as [connect-to-index, strength]
        return [neurons.indexOf(connection.neuron), connection.strengthPercent]
      }))
      if (inputNeurons.includes(neuron)) data += ' in'
      else if (outputNeurons.includes(neuron)) data += ' out'
      data += '\n'
    })
    const path = `./saved-brains/${this.id}.brain`
    fs.outputFileSync(path, data)
    console.log(`Brain saved to path: "${path}"`)
  }
}
