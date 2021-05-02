export default {
  BRAIN_ADD_SUB_CHANCE: .001,
  BRAIN_ADD_SUB_CHANCE_TO_ADD: .6, // If we need to add/sub a brain, how likely is it an add instead of a subtract?
  CONNECTION_ADD_SUB_CHANCE: .05,
  CONNECTION_ADD_SUB_CHANCE_TO_ADD: .5, // If we need to add/sub a connection, how likely is it an add instead of a subtract?
  CONNECTION_MUTATION_THRESHOLD: .1, // Maximum absolute amount a connection strength can change
  COST_FACTORS: { // Multipliers for determining total cost
    neurons: 4,
    connections: 2,
    processingMS: 1,
  },
  DEFAULT_CONNECTION_STRENGTH: 0,
  MAX_MODEL_BRAINS: 10,
  MAX_PROCESSING_MS: 500,
  NEURON_ADD_SUB_CHANCE: .01,
  NEURON_ADD_SUB_CHANCE_TO_ADD: .5, // If we need to add/sub a neuron, how likely is it an add instead of a subtract?
}
