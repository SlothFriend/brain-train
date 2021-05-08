import _times from 'lodash/times'
import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'
import ANDBrain from './ANDBrain'
import XORBrain from './XORBrain'

/*
Two bit adder, or 1bit+1bit
One bit can do 0-1 aka 0-1+0-1, or range 0-2
2 needs 2 bits as output...
*/
export default class TwoBitAdder extends Brain {
  static subBrainTypes = [ANDBrain, XORBrain]

  static build(): TwoBitAdder {
    return this.buildFromInAndOut(2, 2)
  }

  static loadFromFile(): TwoBitAdder {
    return super.loadFromFile('./saved-brains/TwoBit_5ca11921-227c-4adb-82e4-87382e69477f.brain')
  }

  static scoreFn: BrainScoreFn = (brain: TwoBitAdder, printResults: boolean = false): number => {
    let score = 0

    // 0 + 0 = 00
    let [b1, b2] = brain.processInput([false, false])
    if (b1) score--
    if (b2) score--

    // 0 + 1 = 01
    ;([b1, b2] = brain.processInput([false, true]))
    if (b1) score--
    if (!b2) score--

    // 1 + 0 = 01
    ;([b1, b2] = brain.processInput([true, false]))
    if (b1) score--
    if (!b2) score--

    // 1 + 1 = 10
    ;([b1, b2] = brain.processInput([true, true]))
    if (!b1) score--
    if (b2) score--

    return score
  }
}
