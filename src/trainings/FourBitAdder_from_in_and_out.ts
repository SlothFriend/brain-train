import FourBitAdder from '../brains/FourBitAdder'
import Trainer from '../classes/Trainer'
import config from '../config'

const trainer = new Trainer(FourBitAdder, 9)

let bestScore = 0
let cycle = 0
while (bestScore < FourBitAdder.topScore) {
  console.log()
  console.log(`Cycle: ${cycle}; Total Gens: ${cycle * config.GENERATION_JUMP}`)
  cycle++

  trainer.mutateBrains(config.GENERATION_JUMP)
  const scores = trainer.cull()
  bestScore = Math.max(bestScore, ...scores)
}

console.log('END RESULTS')
trainer.printAllBrainDetails()
