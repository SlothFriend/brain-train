import { v4 as uuid } from 'uuid'

import Neuron from './Neuron'

export default class Brain {
  public generation: number = 0
  public id: string
  public neuronsToProcess: Neuron[] = []

  constructor(
    public allNeurons: Neuron[],
    public inputNeurons: Neuron[],
    public outputNeurons: Neuron[]
  ) {
    this.id = uuid()
  }

  getOutput (): number[] {
    return this.outputNeurons.map(n => n.fireCount)
  }

  mutate (times: number = 1) {
    this.mutateConnectionStrengths(times)
    this.generation += times
  }

  mutateConnectionStrengths (times: number = 1) {
    this.allNeurons.forEach(neuron => {
      neuron.connections.forEach(connection => {
        for (let i = 0; i < times; i++) {
          connection.mutate()
        }
      })
    })
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
        this.neuronsToProcess.push(...neuronToProcess.fire())
      }
    }
  }

  reset () {
    this.allNeurons.forEach(n => n.reset())
  }
}
