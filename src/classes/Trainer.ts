import _defaults from 'lodash/defaults'
import _difference from 'lodash/difference'
import _sample from 'lodash/sample'
import _sortBy from 'lodash/sortBy'
import Brain from './Brain'
import config from '../config'

interface AddModelBrainOpts {
  overwrite?: boolean
}

interface TrainOpts {
  saveBrain?: boolean
  tieBreakWithCost?: boolean
}

interface TrainerOpts {
  maxModelBrains?: number
}

export type BrainScoreFn = (brain: Brain, printResults?: boolean) => number

export default class Trainer {
  modelBrains: Brain[] = []
  topScore: number = -Infinity
  #brainScorer: BrainScoreFn = null
  #maxModelBrains: number
  #trainingBrains: Brain[] = []

  constructor (brainType: typeof Brain, brainCount: number, options: TrainerOpts = {}) {
    options = _defaults<TrainerOpts, Required<TrainerOpts>>(options, {
      maxModelBrains: config.MAX_MODEL_BRAINS,
    })

    this.#brainScorer = brainType.scoreFn
    this.#maxModelBrains = options.maxModelBrains
    this.#trainingBrains = Array.from(Array(brainCount)).map(x => brainType.build())
  }

  private addModelBrains(brains: Brain[], options: AddModelBrainOpts = {}) {
    options = _defaults<AddModelBrainOpts, Required<AddModelBrainOpts>>(options, {
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
    // console.log('scores:', scores)

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
    this.printModelBrainDetails()
    console.log('Best Score (all time):', this.topScore)

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

  printModelBrainDetails () {
    _sortBy(this.modelBrains, x => -x.cost)
      .slice(-3)
      .forEach(x => x.printDetails())
  }

  resetBrains () {
    this.#trainingBrains.forEach(brain => brain.reset())
  }

  train(generationJump: number, options: Partial<TrainOpts> = {}) {
    options = _defaults<TrainOpts, Required<TrainOpts>>(options, {
      saveBrain: true,
      tieBreakWithCost: true,
    })

    let cycle = 0
    while (this.topScore < 0) {
      console.log(`Cycle: ${cycle}; Total Gens: ${cycle * generationJump}`)
      cycle++

      this.mutateBrains(generationJump)
      const scores = this.cull(options.tieBreakWithCost)
      this.topScore = Math.max(this.topScore, ...scores)
    }

    console.log()
    console.log('END RESULTS - BEST BRAINS:')
    console.log()
    this.modelBrains.forEach(b => { b.printDetails() })


    if (options.saveBrain) this.modelBrains[0].saveToFile()
  }
}
