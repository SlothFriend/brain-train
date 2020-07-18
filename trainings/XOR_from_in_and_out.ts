import XORBrain from '../brains/XORBrain'
import Brain from '../classes/Brain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(XORBrain.scoreFn, [
  Brain.buildFromInAndOut(2, 1),
  Brain.buildFromInAndOut(2, 1),
  Brain.buildFromInAndOut(2, 1),
  Brain.buildFromInAndOut(2, 1),
  Brain.buildFromInAndOut(2, 1),
])

let bestScore = 0
let cycle = 0
while (bestScore < 4) {
  const GENERATION_JUMP = 200
  console.log(`Cycle: ${cycle}; Total Gens: ${cycle * GENERATION_JUMP}`)
  cycle++

  trainer.mutateBrains(GENERATION_JUMP)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
