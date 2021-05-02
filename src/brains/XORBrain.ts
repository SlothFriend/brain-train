import ANDBrain from './ANDBrain'
import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class XORBrain extends Brain {
  static subBrainTypes = [ANDBrain]

  static build(): XORBrain {
    return this.buildFromInAndOut(2, 1)
  }

  static loadFromFile(): XORBrain {
    return super.loadFromFile('./saved-brains/XOR_cdfcb337-c894-46cd-8b1e-423f133eb87c.brain')
  }

  static scoreFn: BrainScoreFn = (brain: XORBrain): number => {
    let score = 0

    // 0 & 0 = 0
    brain.reset()
    const [val1] = brain.processInput([false, false])
    if (val1) score--

    // 0 & 1 = 1
    brain.reset()
    const [val2] = brain.processInput([false, true])
    if (!val2) score--

    // 1 & 0 = 1
    brain.reset()
    const [val3] = brain.processInput([true, false])
    if (!val3) score--

    // 1 & 1 = 0
    brain.reset()
    const [val4] = brain.processInput([true, true])
    if (val4) score--

    return score
  }
}
