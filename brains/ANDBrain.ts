import { Brain, Neuron } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class ANDBrain extends Brain {
  constructor() {
    const input1 = new Neuron()
    const input2 = new Neuron()
    const output = new Neuron()

    input1.connectTo(output)
    input2.connectTo(output)

    const allNeurons = [input1, input2, output]
    const inputNeurons = [input1, input2]
    const outputNeurons = [output]
    super(allNeurons, inputNeurons, outputNeurons)
  }
}

export const scoreFn: BrainScoreFn = (brain: ANDBrain): number => {
  let score = 0

  // 0, 0 = 0
  brain.reset()
  const [andVal1] = brain.processInput([false, false])
  if (andVal1 === 0) score++

  // 0, 1 = 0
  brain.reset()
  const [andVal2] = brain.processInput([false, true])
  if (andVal2 === 0) score++

  // 1, 0 = 0
  brain.reset()
  const [andVal3] = brain.processInput([true, false])
  if (andVal3 === 0) score++

  // 1, 1 = 1
  brain.reset()
  const [andVal4] = brain.processInput([true, true])
  if (andVal4 === 1) score++

  return score
}
