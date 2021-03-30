import _times from 'lodash/times'
import { digitToHalfByte, digitToTwoBits } from './utils/conversions'


_times(4, (n) => {
  console.log(`${n} is ${digitToTwoBits(n)}`)
})
