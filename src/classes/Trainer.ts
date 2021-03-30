import _sample from 'lodash/sample'
import Brain from './Brain'

export type BrainScoreFn = (brain: Brain, printResults: boolean) => number

export default class Trainer {
  #bestBrainIndices: number[] = []
  #brains: Brain[] = []
  #brainScorer: BrainScoreFn = null

  constructor (brainType: typeof Brain, brainCount: number) {
    this.#brainScorer = brainType.scoreFn
    this.#brains = Array.from(Array(brainCount)).map(x => brainType.build())
  }

  // Keep the higher-scoring brains, replace the lower-scoring
  cull (): number[] {
    const scores = this.getScores()
    console.log('scores:', scores)

    const idsWithScores = scores.map((score, i) => ({ id: this.#brains[i].id, index: i, score }))
    idsWithScores.sort((a, b) => {
      if (a.score > b.score) {
        return -1
      } else if (a.score < b.score) {
        return 1
      } else { // Break the tie with cost
        console.log(`Score tie-breaker for score "${a.score}"`)
        return this.#brains[a.index].cost < this.#brains[b.index].cost ? -1 : 1
      }
    }) // Sorted by best first
    // Print results
    console.log()
    console.log('Sorted brains by score (best last): ')
    console.log()
    for (let i = 0, len = idsWithScores.length; i < len; i++) {
      const { score, index } = idsWithScores[len-i-1]
      console.log('Score:', score)
      this.#brains[index].printDetails()
    }

    const topScore = idsWithScores[0].score
    // Get the top third that have the top score
    const topScoringBrains = idsWithScores
      .slice(0, Math.round(idsWithScores.length / 3))
      .filter(x => x.score === topScore)
      .map(({ id }) => this.#brains.find(b => b.id === id))

    // Get the bottom third
    const toReplace = idsWithScores.slice(idsWithScores.length - Math.round(idsWithScores.length / 3))
    toReplace.forEach(({ id }) => {
      const index = this.#brains.findIndex(b => b.id === id)
      // Replace the brain with a copy of one of the best scoring brains
      this.#brains[index] = _sample(topScoringBrains).copy()
    })

    // Record best performing brains
    const { index, score } = idsWithScores[0]
    console.log('Best Score:', score)
    this.#bestBrainIndices = idsWithScores
      .slice(0, Math.round(idsWithScores.length / 3))
      .filter(x => x.score === topScore)
      .map(x => x.index)

    return scores
  }

  getScores () {
    this.resetBrains()
    return this.#brains.map((brain, i) => this.#brainScorer(brain, this.#bestBrainIndices.includes(i)))
  }

  mutateBrains (times: number = 1) {
    // Mutate all brains except the best brain
    this.#brains.forEach((brain, i) => {
      if (!this.#bestBrainIndices.includes(i)) brain.mutate(times)
    })
  }

  printAllBrainDetails () {
    console.log()
    this.#brains.forEach(b => b.printDetails())
    console.log()
  }

  resetBrains () {
    this.#brains.forEach(brain => brain.reset())
  }
}
