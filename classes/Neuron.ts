import Connection from './Connection'

export default class Neuron {
  // 0-1+ which determines firing (2 = 2 firings)
  public chargePercent: number = 0
  public connections: Connection[] = []
  public fireCount: number = 0

  charge (chargePercent: number) {
    this.chargePercent += chargePercent
  }

  connectTo (neuron: Neuron, strengthPercent?: number) {
    this.connections.push(new Connection(neuron, strengthPercent))
  }

  // Transfers charge to connections and returns connections for further processing
  fire (): Neuron[] {
    while (this.chargePercent >= 1) {
      this.connections.forEach(({ neuron: connectedNeuron, strengthPercent }) => {
        connectedNeuron.charge(strengthPercent)
      })

      this.chargePercent -= 1
      this.fireCount++
    }
    return this.connections.map(c => c.neuron)
  }

  mutate (times: number = 1) {
    this.connections.forEach(connection => { connection.mutate(times) })
  }

  reset () {
    this.chargePercent = 0
    this.fireCount = 0
  }
}
