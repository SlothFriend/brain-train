import FourBitAdder from '../brains/FourBitAdder'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(FourBitAdder, 9)
trainer.train(1000, {
  saveBrain: true,
  tieBreakWithCost: true,
})
