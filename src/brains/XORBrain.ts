import { Brain, Neuron } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class XORBrain extends Brain {
  constructor(
    public allNeurons: Neuron[] = [],
    public inputNeurons: Neuron[] = [],
    public outputNeurons: Neuron[] = [],
  ) {
    super(allNeurons, inputNeurons, outputNeurons)

    if (!this.allNeurons.length) {
      const input1 = new Neuron()
      const input2 = new Neuron()
      const n1 = new Neuron()
      const output = new Neuron()

      input1.connectTo(n1)
      input1.connectTo(output)
      input2.connectTo(n1)
      input2.connectTo(output)
      n1.connectTo(output)

      this.allNeurons = [input1, input2, n1, output]
      this.inputNeurons = [input1, input2]
      this.outputNeurons = [output]
    }
  }

  static scoreFn: BrainScoreFn = (brain: XORBrain): number => {
    let score = 0

    // 0, 0 = 0
    brain.reset()
    try {
      const [val1] = brain.processInput([false, false])
      if (!val1) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 0, 1 = 0
    brain.reset()
    try {
      const [val2] = brain.processInput([false, true])
      if (val2) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1, 0 = 0
    brain.reset()
    try {
      const [val3] = brain.processInput([true, false])
      if (val3) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1, 1 = 1
    brain.reset()
    try {
      const [val4] = brain.processInput([true, true])
      if (!val4) score++
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    return score
  }
}
