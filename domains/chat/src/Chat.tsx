import React, { FC, useCallback } from 'react'
import { useCorsState } from 'use-cors-state'
import { ChatConfigContextProvider } from '@botui/chat-hooks'
import { ChatConfig, Message as MessageType } from '@botui/types'
import { Header, Body, Footer } from './components'
import Amplify from 'aws-amplify'

export const initAmplifyConfig = (awsconfig: Record<string, unknown>): void => {
  Amplify.configure(awsconfig)
}

const manageUpdatedMessage = (
  config: ChatConfig,
  updatedMessage: MessageType
) => ({
  ...config,
  messages: config.messages.reduce<ChatConfig['messages']>((res, message) => {
    // updated: true の場合、後続のメッセージは削除する
    if (
      updatedMessage.updated &&
      res.find(({ id }) => id === updatedMessage.id)
    )
      return res
    return [
      ...res,
      message.id === updatedMessage.id
        ? { ...updatedMessage, updated: false }
        : message
    ]
  }, [])
})

const Chat: FC = () => {
  const [config, setConfig] = useCorsState<ChatConfig | undefined>(
    'chat-config',
    { window: window.parent, domain: /.*/ },
    undefined
  )

  const handleUpdate = useCallback(
    (updatedMessage: MessageType) => {
      if (!config) return
      setConfig(manageUpdatedMessage(config, updatedMessage))
    },
    [config, setConfig]
  )

  if (!config) return <></>

  return (
    <ChatConfigContextProvider {...config}>
      <Header />
      <Body onUpdated={handleUpdate} />
      <Footer />
    </ChatConfigContextProvider>
  )
}

export default Chat
