import config from '../config'
import Neuron from './Neuron'

export default class Connection {
  constructor(
    public neuron: Neuron,
    // determines percentage of charge that flows through on activation
    public strengthPercent: number = config.DEFAULT_CONNECTION_STRENGTH
  ) {}

  mutate (times: number = 1) {
    for (let i = 0; i < times; i++) {
      const strengthChange = (Math.random() > .5 ? 1 : -1) * (Math.random() * config.CONNECTION_MUTATION_THRESHOLD)
      this.strengthPercent += strengthChange
    }
  }
}
