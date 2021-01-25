import {
  Proposals,
  Message,
  ChatConfig,
  Proposal
} from '@botui/types'
import { relayerEvaluate } from './relayerEvaluate'
import { closerEvaluate } from './closerEvaluate'
import { skipperEvaluate, ValueType } from './skipperEvaluate'

type Values = Record<string, ValueType | undefined>

const getValues = (proposals: Proposals): Values => {
  return proposals.reduce<Values>((values, proposal) => {
    if (proposal.type !== 'message') return values
    return proposal.data.content.type === 'form'
      ? { ...values, ...proposal.data.content.props.values }
      : values
  }, {})
}

export interface MessageWithId extends Message {
  id: number | string
}

export const controlMessage = (
  proposals: Proposals,
  chatConfig: ChatConfig
): [Array<MessageWithId>, ChatConfig['percentOfProgress']] => {
  const values = getValues(proposals)
  const messages: Array<MessageWithId> = []
  let skipNumber: number
  let edgeProposal: Proposal | undefined = undefined
  proposals.some((proposal) => {
    edgeProposal = proposal
    if (skipNumber) {
      --skipNumber
      return false
    }
    if (proposal.type === 'skipper') {
      const { data: skipper } = proposal
      skipNumber = skipperEvaluate(skipper, values)
      return false
    }
    if (proposal.type === 'relayer') {
      !proposal.completed && relayerEvaluate(proposal.data, values)
      return false
    }
    if (proposal.type === 'closer') {
      !proposal.completed && closerEvaluate(proposal.data, values, chatConfig)
      if (chatConfig.onClose) chatConfig.onClose()
      return true
    }
    if (proposal.type === 'message') {
      messages.push(messageReplace(proposal.data, values))
      return !proposal.completed
    }
    return false
  })

  if (messages.length === 1 && chatConfig.onStart) {
    chatConfig.onStart()
  }

  const percent = progressPercent(proposals, edgeProposal)

  return [messages, percent]
}

const messageReplace = (message: Message, values: Values): Message => {
  if (message.content.type !== 'string') return message
  if (typeof message.content.props.children !== 'string') return message
  return {
    ...message,
    content: {
      ...message.content,
      props: {
        ...message.content.props,
        children: message.content.props.children.replace(
          /\{\{(.+?)\}\}/g,
          (_, key) => `${values[key] ?? ''}`
        )
      }
    }
  }
}

const progressPercent = (
  proposals: Proposals,
  edge?: Proposal
) => {
  if (!edge) return 0
  const edgeIndex = proposals.findIndex(({ id }) => id === edge.id)
  return (edgeIndex + 1) / proposals.length
}