import ThreeBitAdder from '../brains/ThreeBitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(ThreeBitAdder, 5)
trainer.train(3000, {
  saveBrain: true,
  tieBreakWithCost: true,
})
