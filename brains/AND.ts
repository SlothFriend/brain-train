import { Brain, Neuron } from '../classes'

class ANDBrain extends Brain {
  constructor() {
    const input1 = new Neuron()
    const input2 = new Neuron()
    const output = new Neuron()

    input1.connectTo(output)
    input2.connectTo(output)

    const allNeurons = [input1, input2, output]
    const inputNeurons = [input1, input2]
    const outputNeurons = [output]
    super(allNeurons, inputNeurons, outputNeurons)
  }
}

const brain = new ANDBrain()

let generation = 0
while (true) {
  console.log('\nGENERATION:', generation++)
  brain.processInput([true, true])
  const [andVal] = brain.printOutput()
  if (andVal >= 1) {
    console.log('\nSUCCESS!!!')
    break
  }

  brain.reset()
  brain.mutateConnectionStrengths()
}
