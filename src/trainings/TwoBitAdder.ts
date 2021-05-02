import TwoBitAdder from '../brains/TwoBitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(TwoBitAdder, 5)
trainer.train(5000, {
  saveBrain: false,
  tieBreakWithCost: true,
})
