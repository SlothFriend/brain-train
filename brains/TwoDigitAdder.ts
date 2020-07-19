import { Brain } from '../classes'
import { BrainScoreFn } from '../classes/Trainer'
import _times from 'lodash/times'
import { digitToHalfByte, halfByteToDigit } from '../utils/conversions'

export default class TwoDigitAdder extends Brain {
  static build(): TwoDigitAdder {
    return Brain.buildFromInAndOut(8, 4) // two nibbles for two digits, one nibble for output
  }

  static topScore = 4 * 4 // Each digit added with every other digit
  static scoreFn: BrainScoreFn = (brain: TwoDigitAdder): number => {
    let score = 0

    // Add up each digit against every other
    _times(4, (n1) => {
      _times(4, (n2) => {
        brain.reset()
        try {
          const output = brain.processInput([...digitToHalfByte(n1), ...digitToHalfByte(n2)])
          const outNum = halfByteToDigit(output)
          const answer = n1 + n2
          if (outNum === answer) score++
        } catch (e) {
          console.error('Score attempt failed:', e)
        }
      })
    })

    return score
  }
}
