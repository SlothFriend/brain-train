import _defaults from 'lodash/defaults'
import _sample from 'lodash/sample'
import Brain from './Brain'

interface TrainOptions {
  saveBrain: boolean
  tieBreakWithCost: boolean
}

export type BrainScoreFn = (brain: Brain, printResults?: boolean) => number

export default class Trainer {
  #bestBrainIndices: number[] = []
  #brains: Brain[] = []
  #brainScorer: BrainScoreFn = null

  constructor (brainType: typeof Brain, brainCount: number) {
    this.#brainScorer = brainType.scoreFn
    this.#brains = Array.from(Array(brainCount)).map(x => brainType.build())
  }

  get bestBrain(): Brain {
    return this.#brains[this.#bestBrainIndices[0]]
  }

  // Keep the higher-scoring brains, replace the lower-scoring
  cull (tieBreakWithCost: boolean = false): number[] {
    const scores = this.getScores()
    console.log('scores:', scores)

    const idsWithScores = scores.map((score, i) => ({ id: this.#brains[i].id, index: i, score }))
    idsWithScores.sort((a, b) => {
      if (a.score > b.score) {
        return -1
      } else if (a.score < b.score) {
        return 1
      } else {
        if (tieBreakWithCost) {
          console.log(`Score tie-breaker for score "${a.score}"`)
          return this.#brains[a.index].cost < this.#brains[b.index].cost ? -1 : 1
        }
        return 0
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
    console.log('Best Score:', idsWithScores[0].score)

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

  train(generationJump: number, options: Partial<TrainOptions> = {}) {
    options = _defaults(options, {
      saveBrain: true,
      tieBreakWithCost: false,
    })

    let bestScore = -Infinity
    let cycle = 0
    while (bestScore < 0) {
      console.log(`Cycle: ${cycle}; Total Gens: ${cycle * generationJump}`)
      cycle++

      this.mutateBrains(generationJump)
      const scores = this.cull(options.tieBreakWithCost)
      bestScore = Math.max(bestScore, ...scores)
    }

    console.log('END RESULTS')
    this.printAllBrainDetails()

    if (options.saveBrain) this.bestBrain.save()
  }
}
