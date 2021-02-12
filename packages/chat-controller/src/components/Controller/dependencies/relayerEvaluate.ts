import { Relayer } from '@botui/types'

type Values = Record<string, unknown>

export const evalFunction = async (
  functionString: string,
  values: Values
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  const func = new AsyncFunction('values', functionString)
  await func(values)
  // TODO: 非同期を考慮
}

export const webhook = async (endpoint: string, values: Values): Promise<void> => {
  console.log(endpoint, values)
  // TODO:
}

export const relayerEvaluate = async (relayer: Relayer, values: Values): Promise<void> => {
  if (relayer.job === 'script') evalFunction(relayer.script, values)
  if (relayer.job === 'webhook') webhook(relayer.endpoint, values)
}
