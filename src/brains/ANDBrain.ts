import { Brain, Neuron } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class ANDBrain extends Brain {
  constructor(
    public allNeurons: Neuron[] = [],
    public inputNeurons: Neuron[] = [],
    public outputNeurons: Neuron[] = [],
  ) {
    super(allNeurons, inputNeurons, outputNeurons)

    if (!this.allNeurons.length) {
      const input1 = new Neuron()
      const input2 = new Neuron()
      const output = new Neuron()

      input1.connectTo(output)
      input2.connectTo(output)

      this.allNeurons = [input1, input2, output]
      this.inputNeurons = [input1, input2]
      this.outputNeurons = [output]
    }
  }

  static scoreFn: BrainScoreFn = (brain: ANDBrain): number => {
    let score = 0

    // 0, 0 = 0
    brain.reset()
    const [andVal1] = brain.processInput([false, false])
    if (!andVal1) score++

    // 0, 1 = 0
    brain.reset()
    const [andVal2] = brain.processInput([false, true])
    if (!andVal2) score++

    // 1, 0 = 0
    brain.reset()
    const [andVal3] = brain.processInput([true, false])
    if (!andVal3) score++

    // 1, 1 = 1
    brain.reset()
    const [andVal4] = brain.processInput([true, true])
    if (andVal4) score++

    return score
  }
}
