import { Brain, Neuron } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class XORBrain extends Brain {
  constructor() {
    const input1 = new Neuron()
    const input2 = new Neuron()
    const n1 = new Neuron()
    const output = new Neuron()

    input1.connectTo(n1)
    input1.connectTo(output)
    input2.connectTo(n1)
    input2.connectTo(output)
    n1.connectTo(output)

    const allNeurons = [input1, input2, n1, output]
    const inputNeurons = [input1, input2]
    const outputNeurons = [output]
    super(allNeurons, inputNeurons, outputNeurons)
  }

  static scoreFn: BrainScoreFn = (brain: XORBrain): number => {
    let score = 0

    // 0, 0 = 0
    brain.reset()
    try {
      const [val1] = brain.processInput([false, false])
      if (val1 === 0) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 0, 1 = 0
    brain.reset()
    try {
      const [val2] = brain.processInput([false, true])
      if (val2 === 1) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1, 0 = 0
    brain.reset()
    try {
      const [val3] = brain.processInput([true, false])
      if (val3 === 1) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1, 1 = 1
    brain.reset()
    try {
      const [val4] = brain.processInput([true, true])
      if (val4 === 0) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    return score
  }
}
