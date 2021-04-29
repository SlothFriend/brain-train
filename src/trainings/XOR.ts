import XORBrain from '../brains/XORBrain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(XORBrain, 5)
trainer.train(1000, {
  saveBrain: true,
  tieBreakWithCost: true,
})
