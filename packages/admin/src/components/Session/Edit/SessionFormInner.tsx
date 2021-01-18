import { FC } from 'react'
import { Grid, Box } from '@material-ui/core'
import {
  RadioButtonGroupInput,
  FormDataConsumer,
  TextInput,
  BooleanInput,
  required,
  Labeled
} from 'react-admin'
import { ImageInput, ColorInput } from '../parts'
import isColor from 'is-color'
import { Preview } from '@botui/chat-controller'
import PreviewDialog from './PreviewDialog'
import { Session } from '@botui/types'
import { stringMessageTemplate } from '../Create/proposalTemplates'


const colorValidator = (color: string) => {
  return isColor(color) ? null : '入力内容が間違っています'
}

const sampleProposals = [
  stringMessageTemplate(
    'こんにちは！こちらではチャットのデザインをお好みに合わせて変更できます。',
    0
  ),
  stringMessageTemplate('左側のメッセージが「オペレーターメッセージ」です。', 0),
  stringMessageTemplate(
    'そして、こちら右側が「ユーザメッセージ」です。',
    0,
    true
  )
]

const SessionFormInner: FC = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <Box p={2}>
          <TextInput source="title" resource="sessions" fullWidth />
          <BooleanInput source="active" resource="sessions" />
          <PreviewDialog />
        </Box>
      </Grid>
      <Grid item xs={6} />
      <Grid item xs={6}>
        <Box p={2}>
          <ColorInput
            source="theme.header.backgroundColor"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="ヘッダー"
          />
          <ColorInput
            source="theme.agent.backgroundColor"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="オペレーターメッセージバルーン"
          />
          <ColorInput
            source="theme.agent.color"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="オペレーターメッセージ"
          />
          <ColorInput
            source="theme.user.backgroundColor"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="ユーザメッセージバルーン"
          />
          <ColorInput
            source="theme.user.color"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="ユーザーメッセージ"
          />
          <ColorInput
            source="theme.footer.backgroundColor"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="フッター"
          />
          <ColorInput
            source="theme.progressBar.backgroundColor"
            resource="sessions"
            validate={[required(), colorValidator]}
            label="プログレスバー"
          />
          <FormDataConsumer>
            {({ formData }) => (
              <ImageInput
                source="images.logo.key"
                resource="sessions"
                label="ヘッダーロゴ"
                sessionId={formData.id}
              />
            )}
          </FormDataConsumer>
          <RadioButtonGroupInput
            source="images.agent"
            resource="sessions"
            initialValue="/operator_female1.jpg"
            label="オペレーターアイコン"
            row
            fullWidth
            choices={[
              { id: '/operator_female1.jpg', name: '女性1' },
              { id: '/operator_female2.jpg', name: '女性2' },
              { id: '/operator_female3.jpg', name: '女性3' },
              { id: '/operator_male1.jpg', name: '男性1' },
              { id: '/operator_bot1.jpg', name: 'ボット' }
            ]}
          />
          <TextInput source="email" type="email" fullWidth />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <FormDataConsumer>
          {({ formData }) => (
            <Labeled label="プレビュー">
              <Preview
                proposals={sampleProposals}
                chatConfig={{
                  ...(formData as Session),
                  messages: sampleProposals.map(({ data }) => data),
                  messagesCount: 5
                }}
              />
            </Labeled>
          )}
        </FormDataConsumer>
      </Grid>
    </Grid>
  )
}

export default SessionFormInner