/**
 * Execution units (memory and CPU steps)
 */
export type ExecutionUnits = {
  memory: string // Memory units
  steps: string // CPU steps
}

/**
 * Execution unit estimation (Phase 1 - local only)
 *
 * Note: This is a rough estimation. Accurate calculation requires
 * Phase 2 backend evaluation.
 */
export function estimateExecutionUnits(
  scriptSize: number,
  redeemerSize: number,
  protocolParams: {
    scriptExecutionPrices?: {
      memory: {numerator: string; denominator: string}
      cpu: {numerator: string; denominator: string}
    }
    maxExecutionUnits?: {
      perTransaction: {
        memory: string
        cpu: string
      }
    }
  },
): ExecutionUnits {
  // Rough estimation based on script and redeemer sizes
  // Actual calculation would require script evaluation

  const baseMemory = scriptSize * 100 // Rough estimate: 100 units per byte
  const baseSteps = scriptSize * 50 // Rough estimate: 50 steps per byte

  // Add redeemer overhead
  const redeemerMemory = redeemerSize * 50
  const redeemerSteps = redeemerSize * 25

  // Apply safety margin (50%)
  const estimatedMemory = Math.floor((baseMemory + redeemerMemory) * 1.5)
  const estimatedSteps = Math.floor((baseSteps + redeemerSteps) * 1.5)

  // Cap at maximum if protocol params available
  if (protocolParams.maxExecutionUnits) {
    const maxMem = parseInt(
      protocolParams.maxExecutionUnits.perTransaction.memory,
      10,
    )
    const maxCpu = parseInt(
      protocolParams.maxExecutionUnits.perTransaction.cpu,
      10,
    )

    return {
      memory: Math.min(estimatedMemory, maxMem).toString(),
      steps: Math.min(estimatedSteps, maxCpu).toString(),
    }
  }

  return {
    memory: estimatedMemory.toString(),
    steps: estimatedSteps.toString(),
  }
}

/**
 * Calculate script fee from execution units
 */
export function calculateScriptFee(
  executionUnits: ExecutionUnits,
  protocolParams: {
    scriptExecutionPrices: {
      memory: {numerator: string; denominator: string}
      cpu: {numerator: string; denominator: string}
    }
  },
): string {
  const {memory, steps} = executionUnits
  const {scriptExecutionPrices} = protocolParams

  // Calculate memory fee
  const memNum = BigInt(scriptExecutionPrices.memory.numerator)
  const memDen = BigInt(scriptExecutionPrices.memory.denominator)
  const memUnits = BigInt(memory)
  const memFee = (memUnits * memNum) / memDen

  // Calculate CPU fee
  const cpuNum = BigInt(scriptExecutionPrices.cpu.numerator)
  const cpuDen = BigInt(scriptExecutionPrices.cpu.denominator)
  const cpuUnits = BigInt(steps)
  const cpuFee = (cpuUnits * cpuNum) / cpuDen

  // Total fee
  const totalFee = memFee + cpuFee

  return totalFee.toString()
}
