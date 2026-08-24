export type YieldSimulationInput = {
  initialCapital: number;
  annualRate: number;
  days: number;
  estimatedGas: number;
};

export type YieldSimulationResult = {
  endingCapital: number;
  returnPct: number;
  estimatedGas: number;
  methodology: "simple-yield-v0";
};

/** Placeholder deterministic simulator. Replace with historical protocol-rate replay. */
export function simulateYield(input: YieldSimulationInput): YieldSimulationResult {
  const gross = input.initialCapital * input.annualRate * (input.days / 365);
  const endingCapital = input.initialCapital + gross - input.estimatedGas;
  return {
    endingCapital,
    returnPct: (endingCapital / input.initialCapital) - 1,
    estimatedGas: input.estimatedGas,
    methodology: "simple-yield-v0",
  };
}

