import FourBitAdder from '../brains/FourBitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(FourBitAdder, 5)
trainer.train(5000, {
  saveBrain: true,
  tieBreakWithCost: true,
})
