import _times from 'lodash/times'
import config from '../config'
import Neuron from './Neuron'

export default class Connection {
  constructor(
    public neuron: Neuron,
    // Determines percentage of charge that flows through on activation
    public strengthPercent: number = config.DEFAULT_CONNECTION_STRENGTH
  ) {}

  mutate (times: number = 1) {
    _times(times, () => {
      // Random amount from [-CONNECTION_MUTATION_THRESHOLD, CONNECTION_MUTATION_THRESHOLD]
      const strengthChange = (Math.random() > .5 ? 1 : -1) * (Math.random() * config.CONNECTION_MUTATION_THRESHOLD)
      this.strengthPercent += strengthChange
    })

    // Ensure absolute strength percent doesn't go above 1
    // if (this.strengthPercent < -1) this.strengthPercent = -1
    // else if (this.strengthPercent > 1) this.strengthPercent = 1
  }
}
