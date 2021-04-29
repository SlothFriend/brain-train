import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'
import _times from 'lodash/times'
import { halfByteToDigit, digitToTwoBits } from '../utils/conversions'

const BITS = 2
const COMBOS = 2**BITS

/*
Four bit adder, or 2bit+2bit
Two bits can do 0-3 aka 0-3+0-3, or range 0-6
6 needs 3 bits as output...
*/
export default class TwoDigitAdder extends Brain {
  static build(): TwoDigitAdder {
    return Brain.buildFromInAndOut(4, 3)
  }

  static topScore = COMBOS**2 // Each bit combination added with each bit combination
  static scoreFn: BrainScoreFn = (brain: TwoDigitAdder, printResults: boolean = false): number => {
    let score = 0

    // Add up each digit against every other
    if (printResults) console.log(`\nBrain "${brain.id}" results:`)
    _times(COMBOS, (n1) => {
      _times(COMBOS, (n2) => {
        try {
          brain.reset()
          const input = [...digitToTwoBits(n1), ...digitToTwoBits(n2)]
          const output = brain.processInput(input)
          const outNum = halfByteToDigit([false, ...output])
          const answer = n1 + n2
          score -= Math.abs(outNum - answer)
          // if (printResults) console.log(`${n1}+${n2}=${answer}`, input, output, outNum === answer ? 'correct' : 'WRONG')
          // if (outNum === answer) score++
        } catch (e) {
          console.error('Score attempt failed:', e)
        }
      })
    })

    return score
  }
}
