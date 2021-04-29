import { Brain, Neuron } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class XORBrain extends Brain {
  static build(): XORBrain {
    return Brain.buildFromInAndOut(2, 1)
  }

  static scoreFn: BrainScoreFn = (brain: XORBrain): number => {
    let score = 0

    // 0 & 0 = 0
    brain.reset()
    try {
      const [val1] = brain.processInput([false, false])
      if (val1) score--
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 0 & 1 = 1
    brain.reset()
    try {
      const [val2] = brain.processInput([false, true])
      if (!val2) score--
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1 & 0 = 1
    brain.reset()
    try {
      const [val3] = brain.processInput([true, false])
      if (!val3) score--
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    // 1 & 1 = 0
    brain.reset()
    try {
      const [val4] = brain.processInput([true, true])
      if (val4) score--
    } catch (e) {
      console.log('Score attempt failed:', e)
    }

    return score
  }
}
