import _times from 'lodash/times'
import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'
import TwoBitAdder from './TwoBitAdder'
import ANDBrain from './ANDBrain'
import XORBrain from './XORBrain'

/*
Three bit adder, or 1bit+2bit
One bit can do 0-1, two bits can do 0-3 aka 0-1+0-3, or range 0-4
4 needs 3 bits as output...
*/
export default class ThreeBitAdder extends Brain {
  static subBrainTypes = [TwoBitAdder]

  static build(): ThreeBitAdder {
    return this.buildFromInAndOut(3, 3)
  }

  // static loadFromFile(): ThreeBitAdder {
  //   return super.loadFromFile('./saved-brains/TwoBit_5ca11921-227c-4adb-82e4-87382e69477f.brain')
  // }

  static scoreFn: BrainScoreFn = (brain: TwoBitAdder, printResults: boolean = false): number => {
    let score = 0

    // 0 + 0 = 0 (000 => 000)
    let [b1, b2, b3] = brain.processInput([false, false, false])
    if (b1) score--
    if (b2) score--
    if (b3) score--

    // 0 + 1 = 1 (001 => 001)
    ;([b1, b2, b3] = brain.processInput([false, false, true]))
    if (b1) score--
    if (b2) score--
    if (!b3) score--

    // 0 + 2 = 2 (010 => 010)
    ;([b1, b2, b3] = brain.processInput([false, true, false]))
    if (b1) score--
    if (!b2) score--
    if (b3) score--

    // 0 + 3 = 3 (011 => 011)
    ;([b1, b2, b3] = brain.processInput([false, true, true]))
    if (b1) score--
    if (!b2) score--
    if (!b3) score--

    // 1 + 0 = 1 (100 => 001)
    ;([b1, b2, b3] = brain.processInput([true, false, false]))
    if (b1) score--
    if (b2) score--
    if (!b3) score--

    // 1 + 1 = 2 (101 => 010)
    ;([b1, b2, b3] = brain.processInput([true, false, true]))
    if (b1) score--
    if (!b2) score--
    if (b3) score--

    // 1 + 2 = 3 (110 => 011)
    ;([b1, b2, b3] = brain.processInput([true, true, false]))
    if (b1) score--
    if (!b2) score--
    if (!b3) score--

    // 1 + 3 = 4 (111 => 100)
    ;([b1, b2, b3] = brain.processInput([true, true, true]))
    if (!b1) score--
    if (b2) score--
    if (b3) score--

    return score
  }
}
