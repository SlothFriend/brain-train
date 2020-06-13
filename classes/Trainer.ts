import Brain from './Brain'

export type BrainScoreFn = (brain: Brain) => number

export default class Trainer {
  constructor (
    public brainScorer: BrainScoreFn,
    public brains?: Brain[]
  ) {}

  // Keep the higher-scoring brains, replace the lower-scoring
  cull (): number[] {
    // Lower third gets replaced
    const scores = this.getScores()
    console.log('scores:', scores)

    const idsWithScores = scores.map((score, i) => ({ id: this.brains[i].id, score, generation: this.brains[i].generation }))
    idsWithScores.sort((a, b) => a.score > b.score ? -1 : 1) // Sorted by best first
    console.log('sorted brains by score: ', idsWithScores)

    // Get the bottom third
    const toReplace = idsWithScores.slice(idsWithScores.length-Math.round(idsWithScores.length/3))
    toReplace.forEach(({ id }) => {
      const index = this.brains.findIndex(b => b.id === id)
      this.brains[index] = new (this.brains[index] as any).constructor()
    })

    // Log best performing brain
    const bestBrainId = idsWithScores[0].id
    console.log('Best Brain:')
    this.brains.find(b => b.id === bestBrainId).printDetails()

    return scores
  }

  getScores () {
    this.resetBrains()
    return this.brains.map(brain => this.brainScorer(brain))
  }

  mutateBrains (times: number = 1) {
    this.brains.forEach(brain => brain.mutate(times))
  }

  printAllBrainDetails () {
    console.log()
    this.brains.forEach(b => b.printDetails())
    console.log()
  }

  resetBrains () {
    this.brains.forEach(brain => brain.reset())
  }
}
