import ANDBrain from './brains/ANDBrain'
import Trainer from './classes/Trainer'

const trainer = new Trainer(ANDBrain.scoreFn, [
  new ANDBrain(),
  new ANDBrain(),
  new ANDBrain(),
])

let bestScore = 0
let cycle = 0
while (bestScore < 4) {
  console.log('Cycle:', cycle++)

  trainer.mutateBrains(50)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
