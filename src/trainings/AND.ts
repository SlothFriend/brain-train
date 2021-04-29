import ANDBrain from '../brains/ANDBrain'
import Trainer from '../classes/Trainer'

const trainer = new Trainer(ANDBrain, 5)
trainer.train(20, {
  saveBrain: false,
  tieBreakWithCost: true,
})

ANDBrain.test(trainer.bestBrain)
