import XORBrain from '../brains/XORBrain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(XORBrain.scoreFn, [
  new XORBrain(),
  new XORBrain(),
  new XORBrain(),
  new XORBrain(),
])

let bestScore = 0
let cycle = 0
while (bestScore < 4) {
  console.log('Cycle:', cycle++)

  trainer.mutateBrains(200)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
