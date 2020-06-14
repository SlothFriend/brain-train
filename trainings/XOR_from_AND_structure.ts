import ANDBrain from '../brains/ANDBrain'
import XORBrain from '../brains/XORBrain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(XORBrain.scoreFn, [
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
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
