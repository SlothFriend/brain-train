import config from '../config'
import Neuron from './Neuron'

export default class Brain {
  public neuronsToProcess: Neuron[] = []

  constructor(
    public allNeurons: Neuron[],
    public inputNeurons: Neuron[],
    public outputNeurons: Neuron[]
  ) {}

  mutateConnectionStrengths () {
    this.allNeurons.forEach(neuron => {
      neuron.connections.forEach(connection => {
        const strengthChange = (Math.random() > .5 ? 1 : -1)*(Math.random()*config.CONNECTION_MUTATION_THRESHOLD)
        connection.strengthPercent += strengthChange
        if (connection.strengthPercent > 1) connection.strengthPercent = 1
        if (connection.strengthPercent < 0) connection.strengthPercent = 0
        console.log('new connection strength: ', connection.strengthPercent)
      })
    })
  }

  printOutput () {
    const output = this.outputNeurons.map(n => n.fireCount)
    console.log('Output: ', output)
    return output
  }

  processInput (input: boolean[]) {
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
  }

  processNeurons () {
    while (this.neuronsToProcess.length) {
      const neuronToProcess = this.neuronsToProcess.pop()
      // console.log(`Processing neuron "${neuronToProcess.id}"...`)
      if (neuronToProcess.chargePercent >= 1) {
        this.neuronsToProcess.push(...neuronToProcess.fire())
      }
    }
  }

  reset () {
    this.allNeurons.forEach(n => n.reset())
  }
}
