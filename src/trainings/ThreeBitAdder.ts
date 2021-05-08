import ThreeBitAdder from '../brains/ThreeBitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(ThreeBitAdder, 9)
trainer.train(5000, {
  saveBrain: true,
  tieBreakWithCost: true,
})
