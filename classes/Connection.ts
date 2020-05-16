import config from '../config'
import Neuron from './Neuron'

export default class Connection {
  constructor(
    public neuron: Neuron,
    // 0-1 which determines percentage of charge that flows through on activation
    public strengthPercent: number = config.DEFAULT_CONNECTION_STRENGTH
  ) {}
}
