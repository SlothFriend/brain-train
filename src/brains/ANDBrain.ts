import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'

export default class ANDBrain extends Brain {
  static build(): ANDBrain {
    return this.buildFromInAndOut(2, 1)
  }

  static loadFromFile(): ANDBrain {
    return super.loadFromFile('./saved-brains/AND_2c56cdf7-5001-4dcc-aa4d-865e2829b722.brain')
  }

  static scoreFn: BrainScoreFn = (brain: ANDBrain, printResults: boolean = false): number => {
    let score = 0

    // 0 & 0 = 0
    brain.reset()
    const [andVal1] = brain.processInput([false, false])
    if (andVal1) score--

    // 0 & 1 = 0
    brain.reset()
    const [andVal2] = brain.processInput([false, true])
    if (andVal2) score--

    // 1 & 0 = 0
    brain.reset()
    const [andVal3] = brain.processInput([true, false])
    if (andVal3) score--

    // 1 & 1 = 1
    brain.reset()
    const [andVal4] = brain.processInput([true, true])
    if (!andVal4) score--

    return score
  }
}
