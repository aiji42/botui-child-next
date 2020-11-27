import { FC } from 'react'
import {
  TextInput,
  FormWithRedirect,
  SaveButton,
  required,
  RadioButtonGroupInput,
  FormWithRedirectProps
} from 'react-admin'
import {
  Paper,
  Box,
  Grid,
  Typography,
  Tooltip,
  Toolbar
} from '@material-ui/core'
import { useForm } from 'react-final-form'
import { ec, inquiry } from './proposalTemplates'
import ThemeColorSelector from './ThemeColorSelector'

const proposalsChoices = [
  {
    id: ec,
    title:
      '名前や住所等の個人情報及び、支払い・配送情報等を獲得するためのテンプレートです。通販サイトでの導入に最適です。',
    name: 'ECサイト用'
  },
  {
    id: inquiry,
    title:
      '名前や住所等の個人情報及び、アンケート式の選択フォームや自由入力のテキストエリアを備えたテンプレートです。お問い合わせフォームやお申込みフォームなどに最適です。',
    name: 'お問い合わせフォーム用'
  },
  {
    id: '[]',
    title: 'テンプレートを使用せず、いちから自由に作成できます。',
    name: 'マニュアル'
  }
]

const Create: FC<Omit<FormWithRedirectProps, 'render'>> = (props) => {
  return (
    <FormWithRedirect
      {...props}
      render={(formProps) => <FormInner {...formProps} />}
    />
  )
}

const FormInner: FC<any> = (props) => {
  const { change } = useForm()
  change('active', false)
  change('images', '{}')
  return (
    <Grid container component={Paper} spacing={1}>
      <Box p={2}>
        <Grid item xs={5}>
          <TextInput source="title" fullWidth validate={[required()]} />
        </Grid>
        <Grid item xs={7} />
        <Grid item xs={12}>
          <RadioButtonGroupInput
            source="proposals"
            label="テンプレート"
            row
            fullWidth
            validate={[required()]}
            optionText={<TemplateChoiceLabel />}
            choices={proposalsChoices}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                テーマカラー *
              </Typography>
            </Grid>
            <Grid container spacing={2}>
              <ThemeColorSelector />
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Grid item xs={12}>
        <Toolbar>
          <Box display="flex" justifyContent="space-between" width="100%">
            <SaveButton
              saving={props.saving}
              disabled={props.pristine}
              invalid={props.invalid}
              handleSubmitWithRedirect={props.handleSubmitWithRedirect}
            />
          </Box>
        </Toolbar>
      </Grid>
    </Grid>
  )
}

const TemplateChoiceLabel: FC<{ record?: { title: string; name: string } }> = ({
  record: { title, name } = { title: '', name: '' }
}) => {
  return (
    <Tooltip title={title}>
      <Typography>{name}</Typography>
    </Tooltip>
  )
}

export default Create
