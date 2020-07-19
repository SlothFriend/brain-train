import TwoDigitAdder from '../brains/TwoDigitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(TwoDigitAdder.scoreFn, [
  TwoDigitAdder.build(),
  TwoDigitAdder.build(),
  TwoDigitAdder.build(),
  TwoDigitAdder.build(),
  TwoDigitAdder.build(),
])

let bestScore = 0
let cycle = 0
while (bestScore < TwoDigitAdder.topScore) {
  const GENERATION_JUMP = 1000
  console.log(`Cycle: ${cycle}; Total Gens: ${cycle * GENERATION_JUMP}`)
  cycle++

  trainer.mutateBrains(GENERATION_JUMP)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
