import _defaults from 'lodash/defaults'
import _difference from 'lodash/difference'
import _sample from 'lodash/sample'
import Brain from './Brain'

interface TrainOptions {
  saveBrain?: boolean
  tieBreakWithCost?: boolean
}

interface TrainerOptions {
  maxModelBrains?: number
}

export type BrainScoreFn = (brain: Brain, printResults?: boolean) => number

export default class Trainer {
  modelBrains: Brain[] = []
  topScore: number = -Infinity
  #brainScorer: BrainScoreFn = null
  #maxModelBrains: number
  #trainingBrains: Brain[] = []

  constructor (brainType: typeof Brain, brainCount: number, options: TrainerOptions = {}) {
    options = _defaults(options, {
      maxModelBrains: 50
    })

    this.#brainScorer = brainType.scoreFn
    this.#maxModelBrains = options.maxModelBrains
    this.#trainingBrains = Array.from(Array(brainCount)).map(x => brainType.build())
  }

  private addModelBrains(brains: Brain[], options) {
    options = _defaults(options, {
      overwrite: false,
    })

    if (options.overwrite) {
      // Replace all new modelBrains
      this.modelBrains = brains.map(brain => brain.copy({ withId: true }))
    } else {
      // See if we have any new top scorers to add
      const currentModelBrainIds = this.modelBrains.map(x => x.id)
      brains.forEach(brain => {
        if (!currentModelBrainIds.includes(brain.id)) {
          if (this.modelBrains.length < this.#maxModelBrains) {
            this.modelBrains.push(brain.copy({ withId: true }))
          } else {
            // No more room, so look for a more costly brain to replace
            for (let i = 0; i < this.modelBrains.length; i++) {
              if (this.modelBrains[i].cost > brain.cost) {
                this.modelBrains[i] = brain.copy({ withId: true })
                break
              }
            }
          }
        }
      })
    }
  }

  // Keep the higher-scoring brains, replace the lower-scoring
  cull (tieBreakWithCost: boolean = false): number[] {
    const scores = this.getScores()
    console.log('scores:', scores)

    const indexWithScores = scores.map((score, i) => ({ index: i, score }))
    indexWithScores.sort((a, b) => {
      if (a.score > b.score) return -1
      else if (a.score < b.score) return 1
      else if (tieBreakWithCost) return this.#trainingBrains[a.index].cost < this.#trainingBrains[b.index].cost ? -1 : 1
      return 0
    }) // Sorted best first

    // Collect new top scorers
    const topScore = indexWithScores[0].score
    const topScoringBrains = indexWithScores
      .filter(x => x.score === topScore)
      .map(({ index }) => this.#trainingBrains[index])

    // Record new model brains
    this.addModelBrains(topScoringBrains, { overwrite: (topScore > this.topScore) })
    this.topScore = Math.max(this.topScore, topScore)

    // Print scoring results
    console.log()
    console.log('Sorted brains by score (best last): ')
    console.log()
    for (let i = 0, len = indexWithScores.length; i < len; i++) {
      const { score, index } = indexWithScores[len-i-1]
      console.log('Score:', score)
      this.#trainingBrains[index].printDetails()
    }
    console.log('Best Score (this cycle):', indexWithScores[0].score)
    console.log('Best Score (all time):', this.topScore)
    console.log('Number of model brains:', this.modelBrains.length)

    // Replace poor-performing brains with copies of the model brains
    // Get the bottom third that aren't top scorers
    const toReplace = indexWithScores
      .slice(indexWithScores.length - Math.round(indexWithScores.length / 3))
      .filter(x => x.score !== topScore)
    toReplace.forEach(({ index }) => {
      // Replace the brain with a copy of one of the best scoring brains
      this.#trainingBrains[index] = _sample(this.modelBrains).copy()
    })

    return scores
  }

  getScores () {
    this.resetBrains()
    return this.#trainingBrains.map(brain => this.#brainScorer(brain))
  }

  mutateBrains (times: number = 1) {
    // Mutate all brains except the best brain
    this.#trainingBrains.forEach(brain => brain.mutate(times))
  }

  printAllBrainDetails () {
    console.log()
    this.#trainingBrains.forEach(b => b.printDetails())
    console.log()
  }

  resetBrains () {
    this.#trainingBrains.forEach(brain => brain.reset())
  }

  train(generationJump: number, options: Partial<TrainOptions> = {}) {
    options = _defaults(options, {
      saveBrain: true,
      tieBreakWithCost: false,
    })

    let cycle = 0
    while (this.topScore < 0) {
      console.log(`Cycle: ${cycle}; Total Gens: ${cycle * generationJump}`)
      cycle++

      this.mutateBrains(generationJump)
      const scores = this.cull(options.tieBreakWithCost)
      this.topScore = Math.max(this.topScore, ...scores)
    }

    console.log('END RESULTS')
    this.printAllBrainDetails()

    if (options.saveBrain) this.modelBrains[0].saveToFile()
  }
}
