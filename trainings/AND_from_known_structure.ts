import ANDBrain from '../brains/ANDBrain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(ANDBrain.scoreFn, [
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
])

let bestScore = 0
let cycle = 0
while (bestScore < 4) {
  const GENERATION_JUMP = 20
  console.log(`Cycle: ${cycle}; Total Gens: ${cycle * GENERATION_JUMP}`)
  cycle++

  trainer.mutateBrains(GENERATION_JUMP)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
