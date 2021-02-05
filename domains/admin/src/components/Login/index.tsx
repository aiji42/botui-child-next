import React, { FC, FormEvent, useCallback, useState } from 'react'
import { useCheckAuth } from 'react-admin'
import { useHistory } from 'react-router-dom'
import {
  Avatar,
  Button,
  TextField,
  Link,
  Paper,
  Grid,
  Typography,
  Box,
  CircularProgress,
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core'
import { customizedTheme } from '../../customizedTheme'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { makeStyles } from '@material-ui/core/styles'
import { Auth, I18n } from 'aws-amplify'
import vocabularies from '../../i18n/amplify/vocabularies'
I18n.putVocabularies(vocabularies)
I18n.setLanguage('ja')

const theme = createMuiTheme({
  palette: {
    primary: customizedTheme.palette.primary,
    secondary: customizedTheme.palette.secondary
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh'
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3)
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  submitWrapper: {
    margin: theme.spacing(3, 0, 2),
    position: 'relative'
  },
  submitProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}))

export function Login() {
  const classes = useStyles()
  const [{ mode, email, password }, controller] = useState({
    mode: 'SignIn',
    email: '',
    password: ''
  })
  const checkAuth = useCheckAuth()
  const history = useHistory()
  checkAuth({}, false).then(() => history.push('/'))

  return (
    <MuiThemeProvider theme={theme}>
      <Grid container component="main" className={classes.root}>
        <Grid item xs={false} sm={4} md={7}>
          <Image />
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          {mode === 'SignIn' && (
            <SignIn email={email} controller={controller} />
          )}
          {mode === 'SignUp' && <SignUp controller={controller} />}
          {mode === 'ConfirmSignUp' && (
            <ConfirmSignUp
              email={email}
              controller={controller}
              password={password}
            />
          )}
          {mode === 'ForgotPassword' && (
            <ForgotPassword email={email} controller={controller} />
          )}
          {mode === 'ResetPassword' && (
            <ResetPassword email={email} controller={controller} />
          )}
        </Grid>
      </Grid>
    </MuiThemeProvider>
  )
}

type Controller = React.Dispatch<React.SetStateAction<{
  mode: string
  email: string
  password: string
}>>

const SignIn: FC<{ controller: Controller; email: string }> = ({ controller, email: defaultEmail }) => {
  const classes = useStyles()
  const [{ email, password }, setDataset] = useState({
    email: defaultEmail,
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const [errorMessage, setErrorMessage] = useState('')
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      Auth.signIn(email, password)
        .then(() => history.push('/'))
        .catch((err) => {
          if (err.code === 'UserNotConfirmedException') {
            controller({ mode: 'ConfirmSignUp', email, password: '' })
          }
          setErrorMessage(I18n.get(err.message))
        })
        .finally(() => setLoading(false))
    },
    [email, password, history, controller]
  )
  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        サインイン
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="メールアドレス"
          name="email"
          autoComplete="email"
          autoFocus
          defaultValue={defaultEmail}
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="パスワード"
          type="password"
          id="password"
          autoComplete="current-password"
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <div className={classes.submitWrapper}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            サインイン
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              className={classes.submitProgress}
              color="primary"
            />
          )}
        </div>
        <Box textAlign="center" mb={2}>
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        </Box>
      </form>
      <Grid container>
        <Grid item xs>
          <Link
            variant="body2"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault()
              controller({ mode: 'ForgotPassword', email, password: '' })
            }}
          >
            パスワードを忘れた場合はこちら
          </Link>
        </Grid>
        <Grid item>
          <Link
            variant="body2"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault()
              controller({ mode: 'SignUp', email, password: '' })
            }}
          >
            新規登録
          </Link>
        </Grid>
      </Grid>
    </div>
  )
}

const SignUp: FC<{ controller: Controller }> = ({ controller }) => {
  const classes = useStyles()
  const [{ email, password }, setDataset] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      Auth.signUp(email, password)
        .then(() => controller({ mode: 'ConfirmSignUp', email, password }))
        .catch((err) => setErrorMessage(I18n.get(err.message)))
        .finally(() => setLoading(false))
    },
    [email, password, controller]
  )
  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        新規登録
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="メールアドレス"
          name="email"
          autoComplete="email"
          autoFocus
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="パスワード"
          type="password"
          id="password"
          autoComplete="new-password"
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <div className={classes.submitWrapper}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            確認コードを受取る
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              className={classes.submitProgress}
              color="primary"
            />
          )}
        </div>
        <Box textAlign="center" mb={2}>
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        </Box>
      </form>
      <Grid container>
        <Grid item xs>
          <Link
            variant="body2"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault()
              controller({ mode: 'SignIn', email, password: '' })
            }}
          >
            サインイン
          </Link>
        </Grid>
      </Grid>
    </div>
  )
}

const ConfirmSignUp: FC<{ email: string; password: string; controller: Controller }> = ({ email, password, controller }) => {
  const classes = useStyles()
  const [{ code }, setDataset] = useState({
    code: ''
  })
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      Auth.confirmSignUp(email, code)
        .then(() => {
          if (!password) {
            controller({ mode: 'SignIn', email, password: '' })
            return
          }
          Auth.signIn(email, password)
            .then(() => history.push('/'))
            .catch((err) => setErrorMessage(I18n.get(err.message)))
        })
        .catch((err) => setErrorMessage(I18n.get(err.message)))
        .finally(() => setLoading(false))
    },
    [email, code, password, history, controller]
  )
  const handleResendCode = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault()
      Auth.resendSignUp(email).catch((err) =>
        setErrorMessage(I18n.get(err.message))
      )
    },
    [email]
  )
  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        アカウント認証
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="code"
          label="確認コード(メールをご確認ください)"
          id="code"
          autoComplete="one-time-code"
          autoFocus
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, code: e.target.value }))
          }
        />
        <div className={classes.submitWrapper}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            アカウントを認証する
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              className={classes.submitProgress}
              color="primary"
            />
          )}
        </div>
        <Box textAlign="center" mb={2}>
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        </Box>
      </form>
      <Grid container>
        <Grid item xs>
          <Link variant="body2" onClick={handleResendCode}>
            確認コードを再送する
          </Link>
        </Grid>
      </Grid>
    </div>
  )
}

const ForgotPassword: FC<{ controller: Controller; email: string }> = ({
  controller, email: defaultEmail
}) => {
  // メアド
  const classes = useStyles()
  const [{ email }, setDataset] = useState({ email: defaultEmail })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      Auth.forgotPassword(email)
        .then(() => controller({ mode: 'ResetPassword', email, password: '' }))
        .catch((err) => setErrorMessage(I18n.get(err.message)))
        .finally(() => setLoading(false))
    },
    [email, controller]
  )
  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        パスワードリセット
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="メールアドレス"
          name="email"
          autoComplete="email"
          autoFocus
          defaultValue={defaultEmail}
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <div className={classes.submitWrapper}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            リセット用の確認コードを受取る
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              className={classes.submitProgress}
              color="primary"
            />
          )}
        </div>
        <Box textAlign="center" mb={2}>
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        </Box>
      </form>
      <Grid container>
        <Grid item xs>
          <Link
            variant="body2"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault()
              controller((prev) => ({ ...prev, mode: 'SignIn' }))
            }}
          >
            サインイン
          </Link>
        </Grid>
        <Grid item>
          <Link
            variant="body2"
            onClick={(e: React.SyntheticEvent) => {
              e.preventDefault()
              controller((prev) => ({ ...prev, mode: 'SignUp' }))
            }}
          >
            新規登録
          </Link>
        </Grid>
      </Grid>
    </div>
  )
}

const ResetPassword: FC<{ email: string; controller: Controller }> = ({ email, controller }) => {
  // メアド・コード・newパスワード
  const classes = useStyles()
  const [{ code, password }, setDataset] = useState({
    code: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      Auth.forgotPasswordSubmit(email, code, password)
        .then(() => controller({ mode: 'SignIn', email, password: '' }))
        .catch((err) => setErrorMessage(I18n.get(err.message)))
        .finally(() => setLoading(false))
    },
    [email, code, password, controller]
  )
  const handleResendCode = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault()
      Auth.forgotPassword(email)
        .catch((err) => setErrorMessage(I18n.get(err.message)))
    },
    [email]
  )
  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        パスワードリセット
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="新しいパスワード"
          type="password"
          id="password"
          autoComplete="new-password"
          autoFocus
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="code"
          label="確認コード(メールをご確認ください)"
          id="code"
          autoComplete="one-time-code"
          onChange={(e) =>
            setDataset((prev) => ({ ...prev, code: e.target.value }))
          }
        />
        <div className={classes.submitWrapper}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            パスワードをリセットする
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              className={classes.submitProgress}
              color="primary"
            />
          )}
        </div>
        <Box textAlign="center" mb={2}>
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        </Box>
      </form>
      <Grid container>
        <Grid item xs>
          <Link variant="body2" onClick={handleResendCode}>
            コードを再送する
          </Link>
        </Grid>
      </Grid>
    </div>
  )
}

const Image: FC = () => (
  <svg viewBox="0 0 500 500">
    <g id="freepik--background-complete--inject-34">
      <rect y="382.4" width={500} height="0.25" style={{ fill: '#ebebeb' }} />
      <rect
        x="288.4"
        y="396.34"
        width="33.12"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="407.08"
        y="393.63"
        width="8.69"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="327.67"
        y="389.21"
        width="68.92"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="194.84"
        y="395.11"
        width="30.3"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="166.72"
        y="395.11"
        width="19.22"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="52.46"
        y="390.89"
        width="46.84"
        height="0.25"
        style={{ fill: '#ebebeb' }}
      />
      <path
        d="M237,337.8H43.91a5.71,5.71,0,0,1-5.7-5.71V60.66A5.71,5.71,0,0,1,43.91,55H237a5.71,5.71,0,0,1,5.71,5.71V332.09A5.71,5.71,0,0,1,237,337.8ZM43.91,55.2a5.46,5.46,0,0,0-5.45,5.46V332.09a5.46,5.46,0,0,0,5.45,5.46H237a5.47,5.47,0,0,0,5.46-5.46V60.66A5.47,5.47,0,0,0,237,55.2Z"
        style={{ fill: '#ebebeb' }}
      />
      <path
        d="M453.31,337.8H260.21a5.72,5.72,0,0,1-5.71-5.71V60.66A5.72,5.72,0,0,1,260.21,55h193.1A5.71,5.71,0,0,1,459,60.66V332.09A5.71,5.71,0,0,1,453.31,337.8ZM260.21,55.2a5.47,5.47,0,0,0-5.46,5.46V332.09a5.47,5.47,0,0,0,5.46,5.46h193.1a5.47,5.47,0,0,0,5.46-5.46V60.66a5.47,5.47,0,0,0-5.46-5.46Z"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="57.34"
        y="77.96"
        width="170.29"
        height="156.78"
        transform="translate(284.97 312.71) rotate(180)"
        style={{ fill: '#e6e6e6' }}
      />
      <rect
        x="53.3"
        y="77.96"
        width="172.58"
        height="156.78"
        transform="translate(279.17 312.71) rotate(180)"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="69.04"
        y="77.32"
        width="141.1"
        height="158.07"
        transform="translate(295.94 16.77) rotate(90)"
        style={{ fill: '#fafafa' }}
      />
      <polygon
        points="199.09 226.9 145.93 85.81 123.55 85.81 176.71 226.9 199.09 226.9"
        style={{ fill: '#fff' }}
      />
      <polygon
        points="170.36 226.9 117.21 85.81 101.8 85.81 154.95 226.9 170.36 226.9"
        style={{ fill: '#fff' }}
      />
      <rect
        x="47.84"
        y="152.02"
        width="141.1"
        height="8.66"
        transform="translate(274.74 37.97) rotate(90)"
        style={{ fill: '#e6e6e6' }}
      />
      <rect
        x="96.03"
        y="152.03"
        width="141.1"
        height="8.66"
        transform="translate(322.94 -10.23) rotate(90)"
        style={{ fill: '#e6e6e6' }}
      />
      <rect
        x="39.73"
        y="150.45"
        width="151.9"
        height="10.94"
        transform="translate(271.61 40.24) rotate(90)"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="87.93"
        y="150.45"
        width="151.9"
        height="10.94"
        transform="translate(319.8 -7.95) rotate(90)"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="-9.61"
        y="155.97"
        width="141.1"
        height="0.77"
        transform="translate(217.29 95.42) rotate(90)"
        style={{ fill: '#e6e6e6' }}
      />
      <rect
        x="183.23"
        y="164.94"
        width="109.22"
        height="325.69"
        transform="translate(565.63 89.94) rotate(90)"
        style={{ fill: '#f0f0f0' }}
      />
      <rect
        x="217.51"
        y="150.11"
        width="40.68"
        height="299.19"
        rx="2.72"
        transform="translate(537.56 61.86) rotate(90)"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="212.34"
        y="200.54"
        width="51.02"
        height="299.19"
        rx="2.72"
        transform="translate(587.98 112.29) rotate(90)"
        style={{ fill: '#f5f5f5' }}
      />
      <path
        d="M327.55,278.69H148.14a5.29,5.29,0,0,0,5.29,5.29H322.26A5.29,5.29,0,0,0,327.55,278.69Z"
        style={{ fill: '#f0f0f0' }}
      />
      <path
        d="M327.55,324H148.14a5.29,5.29,0,0,0,5.29,5.29H322.26A5.29,5.29,0,0,0,327.55,324Z"
        style={{ fill: '#f0f0f0' }}
      />
      <rect
        x="358.23"
        y="315.63"
        width="109.22"
        height="24.31"
        transform="translate(740.63 -85.06) rotate(90)"
        style={{ fill: '#e6e6e6' }}
      />
      <rect
        x="234.48"
        y="106.96"
        width="6.73"
        height="325.69"
        transform="translate(-31.96 507.65) rotate(-90)"
        style={{ fill: '#fafafa' }}
      />
      <path
        d="M372.06,256.69a9.75,9.75,0,0,0,19.5,0Z"
        style={{ fill: '#f5f5f5' }}
      />
      <path
        d="M346.07,256.69a9.75,9.75,0,0,0,19.5,0Z"
        style={{ fill: '#f5f5f5' }}
      />
      <path
        d="M78.5,263.15c0,1.81,8.11,3.29,18.11,3.29s18.11-1.48,18.11-3.29Z"
        style={{ fill: '#f5f5f5' }}
      />
      <path
        d="M78.5,261.42c0,1.82,8.11,3.3,18.11,3.3s18.11-1.48,18.11-3.3Z"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="409.48"
        y="257.65"
        width="6.73"
        height="24.31"
        transform="translate(143.04 682.65) rotate(-90)"
        style={{ fill: '#e0e0e0' }}
      />
      <rect
        x="354.96"
        y="75.96"
        width="59.44"
        height="77.45"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="352.19"
        y="75.96"
        width="59.44"
        height="77.45"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="360.18"
        y="86.37"
        width="43.47"
        height="56.64"
        style={{ fill: '#fff' }}
      />
      <rect
        x="296.16"
        y="159.21"
        width="59.44"
        height="93.92"
        transform="translate(119.71 532.05) rotate(-90)"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="293.3"
        y="159.21"
        width="59.44"
        height="93.92"
        transform="translate(116.85 529.19) rotate(-90)"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="301.29"
        y="169.62"
        width="43.47"
        height="73.1"
        transform="translate(116.85 529.19) rotate(-90)"
        style={{ fill: '#fff' }}
      />
      <rect
        x="398.84"
        y="169.34"
        width="48.33"
        height="47.62"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="396.07"
        y="169.34"
        width="48.33"
        height="47.62"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="404.06"
        y="179.75"
        width="32.36"
        height="26.81"
        style={{ fill: '#fff' }}
      />
      <rect
        x="291.26"
        y="112.39"
        width="48.33"
        height="47.62"
        style={{ fill: '#ebebeb' }}
      />
      <rect
        x="288.5"
        y="112.39"
        width="48.33"
        height="47.62"
        style={{ fill: '#f5f5f5' }}
      />
      <rect
        x="296.49"
        y="122.8"
        width="32.36"
        height="26.81"
        style={{ fill: '#fff' }}
      />
    </g>
    <g id="freepik--Shadow--inject-34">
      <ellipse
        id="freepik--path--inject-34"
        cx={250}
        cy="416.24"
        rx="193.89"
        ry="11.32"
        style={{ fill: '#f5f5f5' }}
      />
    </g>
    <g id="freepik--Smartphone--inject-34">
      <rect
        x="315.75"
        y="128.08"
        width="1.04"
        height="6.58"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M316.79,122.73h-1a14.47,14.47,0,0,0-14.46-14.45v-1A15.51,15.51,0,0,1,316.79,122.73Z"
        style={{ fill: '#407BFF' }}
      />
      <rect
        x="151.41"
        y="110.88"
        width="161.74"
        height="305.22"
        rx="11.86"
        style={{ fill: '#407BFF' }}
      />
      <rect
        x="83.43"
        y="187.19"
        width="296.09"
        height="152.6"
        rx="7.29"
        transform="translate(494.96 32.01) rotate(90)"
        style={{ fill: '#fff', opacity: '0.9500000000000001' }}
      />
      <circle cx="231.48" cy="391.98" r="8.25" style={{ fill: '#407BFF' }} />
      <path
        d="M225.17,114.61a6.81,6.81,0,0,0,13.62,0Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M276.51,144.16h-89a13.74,13.74,0,0,0-13.7,13.7V167a13.74,13.74,0,0,0,13.7,13.7h89l13.7,8.12v-31A13.75,13.75,0,0,0,276.51,144.16Z"
        style={{ fill: '#407BFF', opacity: '0.7000000000000001' }}
      />
      <rect
        x="189.94"
        y="157.25"
        width="84.09"
        height="2.28"
        style={{ fill: '#fff' }}
      />
      <rect
        x="206.12"
        y="165.33"
        width="67.91"
        height="2.28"
        style={{ fill: '#fff' }}
      />
      <path
        d="M187.46,205h89a13.74,13.74,0,0,1,13.7,13.7v9.13a13.74,13.74,0,0,1-13.7,13.7h-89l-13.7,8.12v-31A13.73,13.73,0,0,1,187.46,205Z"
        style={{ fill: '#407BFF', opacity: '0.15' }}
      />
      <rect
        x="189.94"
        y="218.08"
        width="84.09"
        height="2.28"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
      <rect
        x="189.94"
        y="226.17"
        width={39}
        height="2.28"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
      <rect
        x="235.03"
        y="226.17"
        width="15.86"
        height="2.28"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
      <path
        d="M276.51,265.83h-89a13.74,13.74,0,0,0-13.7,13.7v9.13a13.73,13.73,0,0,0,13.7,13.7h89l13.7,8.12v-31A13.75,13.75,0,0,0,276.51,265.83Z"
        style={{ fill: '#407BFF', opacity: '0.7000000000000001' }}
      />
      <rect
        x="189.94"
        y="278.91"
        width="84.09"
        height="2.28"
        style={{ fill: '#fff' }}
      />
      <rect
        x="206.12"
        y={287}
        width="67.91"
        height="2.28"
        style={{ fill: '#fff' }}
      />
      <path
        d="M187.46,326.66h34.63a13.75,13.75,0,0,1,13.7,13.7v9.14a13.75,13.75,0,0,1-13.7,13.7H187.46l-13.7,8.11V340.36A13.74,13.74,0,0,1,187.46,326.66Z"
        style={{ fill: '#407BFF', opacity: '0.15' }}
      />
      <path
        d="M194.4,344.93a4,4,0,1,1-4-4A4.05,4.05,0,0,1,194.4,344.93Z"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
      <circle
        cx="202.49"
        cy="341.69"
        r="4.05"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
      <path
        d="M218.67,349.78a4,4,0,1,1-4-4A4,4,0,0,1,218.67,349.78Z"
        style={{ fill: '#407BFF', opacity: '0.5' }}
      />
    </g>
    <g id="freepik--character-2--inject-34">
      <path
        d="M344.33,335.2c1.1,2.19,2.08,4.39,3.11,6.59s2,4.44,2.92,6.68,1.88,4.49,2.76,6.78,1.77,4.58,2.58,7l-3.58-3.37A20.9,20.9,0,0,0,358.6,360a52.82,52.82,0,0,0,7.66-.35c2.64-.28,5.3-.72,8-1.22s5.4-1.12,8-1.73l2.37,5.76a68.34,68.34,0,0,1-8.06,3.77,73.44,73.44,0,0,1-8.49,2.82,51.52,51.52,0,0,1-9.16,1.6,29.12,29.12,0,0,1-10.29-.84l-2.35-.65L345,366.41c-1.92-4.21-4-8.53-6-12.84-1-2.16-2.05-4.33-3.05-6.5s-2-4.35-3-6.53Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M379,358.46l3.93-3.84,6.24,6.75s-2.26,3.95-7.88,1.65Z"
        style={{ fill: '#ffc3bd' }}
      />
      <polygon
        points="388.86 352.08 392.3 357.69 389.18 361.37 382.94 354.62 388.86 352.08"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M326.67,326.21c8-3.09,14.2,1.52,24.31,14.28l-11.84,12.17S311.07,332.19,326.67,326.21Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M341.69,339.41c-3.78-2.45-7.07-1.76-9.85.52,1.05,3.89,3.74,8.35,6.33,12,.61.48,1,.74,1,.74l6.6-6.79A9.14,9.14,0,0,0,341.69,339.41Z"
        style={{ opacity: '0.2' }}
      />
      <polygon
        points="387.6 411.04 397.18 409.93 396.38 390.29 386.81 391.39 387.6 411.04"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M397.26,405.8l-10.79.15a.73.73,0,0,0-.69.66l-1.22,8.49a1.42,1.42,0,0,0,1.35,1.67c3.35-.11,4.89-.36,9.12-.43,2.61,0,10.47.15,14.07.1s3.84-4,2.35-4.35c-6.69-1.5-10.54-3.65-12.77-5.73A2,2,0,0,0,397.26,405.8Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M399.55,403.3a1,1,0,0,1,.92.11.71.71,0,0,1,.39.55c.12,1-2,2.8-2.29,3a.17.17,0,0,1-.2,0,.19.19,0,0,1-.1-.19c.07-1.08.32-3,1.17-3.43Zm-.87,3.06c.84-.73,1.88-1.83,1.81-2.38,0-.06,0-.15-.17-.23a.67.67,0,0,0-.69-.06C399.17,403.94,398.82,404.93,398.68,406.36Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M399.45,406a3,3,0,0,1,2.32-.2.72.72,0,0,1,.31.8.91.91,0,0,1-.47.67c-1,.55-3.12-.27-3.21-.3a.24.24,0,0,1-.13-.15.19.19,0,0,1,.06-.18A3.76,3.76,0,0,1,399.45,406Zm1.86,1,.11-.05a.62.62,0,0,0,.3-.43c0-.24-.05-.33-.13-.37-.48-.31-1.95.09-2.74.6A4.52,4.52,0,0,0,401.31,407Z"
        style={{ fill: '#407BFF' }}
      />
      <polygon
        points="386.81 391.4 396.38 390.29 396.79 400.42 387.17 400.46 386.81 391.4"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M339.84,380s24.86-23.12,41-23.47c11.78-.25,20.2,38.71,20.2,38.71l-14,.27s-2.46-13.78-11.61-17.58c-13.22,19.84-67.11,59.05-62,16.54C321.43,391.46,339.84,380,339.84,380Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M339.84,380s24.86-23.12,41-23.47c11.78-.25,20.2,38.71,20.2,38.71l-14,.27s-2.46-13.78-11.61-17.58c-13.22,19.84-67.11,59.05-62,16.54C321.43,391.46,339.84,380,339.84,380Z"
        style={{ opacity: '0.2' }}
      />
      <polygon
        points="400.99 397.17 384.53 398.75 384.58 392.75 401.99 390.68 400.99 397.17"
        style={{ fill: '#263238' }}
      />
      <path
        d="M307.2,395.94s-10.69-20.88-12-54.51c-.3-7.92,6.83-15.39,15-15.81,6.86-.36,14.12-.45,20-.43s10.38,3.92,11.05,9.58c1.48,12.48,1.74,31.43,9.39,54Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M300.21,341.6c5.89-6.65,7.92-4.53,8.8-3.73,8.16,7.39-3.82,30.4-6.22,33.79a165.91,165.91,0,0,1-3-26.06A13.44,13.44,0,0,1,300.21,341.6Z"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M318.16,305.63c-.66,6.13-2.28,15.54-6.45,19.91,3.28,3.09,8.62,6.13,16.21,7.4,3.92-1.62,4.44-5.23,2.54-7.74-6.7-1.17-6.62-3.07-4.09-7.34Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M321.51,310.62l4.86,7.23a12.67,12.67,0,0,0-1.49,3.21c-2.38-1-5-4.64-4.48-7.32A9.36,9.36,0,0,1,321.51,310.62Z"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M335.72,294.33c3.93,4.17,12.19,4.19,8.64-.75S332.66,291.08,335.72,294.33Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M319.79,293.88c-2.19,8-3.87,12.48-1.38,18a10.64,10.64,0,0,0,18.85,1.49c4-6.32,6.94-18.27.53-24.34A10.69,10.69,0,0,0,319.79,293.88Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M318,301.3c1-.18,5.94-1.68,8.35-4,2.71-2.61,2.73-5.14,2-6.29s-6.45-3.36-9.12-2.85c-4.22.81-3.18,8.28-3.12,10.3A3.35,3.35,0,0,0,318,301.3Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M318,301.3c1-.18,5.94-1.68,8.35-4,2.71-2.61,2.73-5.14,2-6.29s-6.45-3.36-9.12-2.85c-4.22.81-3.18,8.28-3.12,10.3A3.35,3.35,0,0,0,318,301.3Z"
        style={{ fill: '#263238', opacity: '0.7000000000000001' }}
      />
      <path
        d="M313.81,301.85a7.52,7.52,0,0,0,3.91,3.82c2.3.93,3.61-1,3.11-3.35-.45-2.07-2.19-5.06-4.56-5S312.87,299.73,313.81,301.85Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M321.33,290.55c10.2,2.18,17.45,7.92,22.27,4.47,3.41-2.44,1.17-6.89-2.74-10.11-3.34-2.75-8-3.6-9.4-5.85a3.86,3.86,0,0,0,1.58,4s-9.21-1.42-11.76-3.82c-.61,1.43,1.75,4.19,1.75,4.19s-2.6,2.47-10-.32C313.47,285.5,315.53,289.31,321.33,290.55Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M341.59,295.83h-.4l0-.52a4.06,4.06,0,0,0,4.25-2.47,5.53,5.53,0,0,0-1.84-6.2,13.81,13.81,0,0,0-2.87-1.72c-2.37-1.19-5.06-2.54-6.36-6.47l.49-.16c1.23,3.72,3.71,5,6.11,6.16a14.49,14.49,0,0,1,3,1.8,6,6,0,0,1,2,6.79A4.49,4.49,0,0,1,341.59,295.83Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M331.35,301.65c-.22.63-.06,1.28.34,1.44s.91-.22,1.13-.85.06-1.28-.34-1.44S331.56,301,331.35,301.65Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M338.89,303.93c-.21.63-.06,1.27.35,1.43s.91-.21,1.12-.85.07-1.27-.34-1.44S339.11,303.29,338.89,303.93Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M336.12,303.16a25.22,25.22,0,0,0,1.12,6.6c-1.46.6-3.17-.62-3.17-.62Z"
        style={{ fill: '#ed847e' }}
      />
      <path
        d="M330,310.66a5.88,5.88,0,0,1-2.8-3.48.18.18,0,0,1,.14-.23.19.19,0,0,1,.23.15,5.65,5.65,0,0,0,3.35,3.56.2.2,0,0,1,.11.26.17.17,0,0,1-.24.11A6.45,6.45,0,0,1,330,310.66Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M329.3,297.51a.4.4,0,0,1-.15-.14.39.39,0,0,1,.11-.54,3.69,3.69,0,0,1,3.49-.35.4.4,0,0,1,.2.53.37.37,0,0,1-.5.19h0a3,3,0,0,0-2.76.31A.39.39,0,0,1,329.3,297.51Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M341.46,302.06a.41.41,0,0,1-.26-.27,3.31,3.31,0,0,0-1.9-2.2.41.41,0,0,1-.26-.5.36.36,0,0,1,.47-.25,4.08,4.08,0,0,1,2.42,2.74.38.38,0,0,1-.25.49A.41.41,0,0,1,341.46,302.06Z"
        style={{ fill: '#263238' }}
      />
      <polygon
        points="420.83 415.71 426.53 407.42 411.18 394.05 405.48 402.34 420.83 415.71"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M422.59,403.5l-6.69,8.33a.78.78,0,0,0,0,1l5.21,6.48a1.32,1.32,0,0,0,2.06,0c2.11-2.72,3.52-4.81,6.23-8.19,1.67-2.08,6.92-8.16,9.23-11s-.33-5.64-1.54-4.68c-5.43,4.29-10.26,6.92-13.18,7.32A2.1,2.1,0,0,0,422.59,403.5Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M422.15,400.08a1.07,1.07,0,0,1,.64-.68.74.74,0,0,1,.68,0c.91.53,1,3.31,1,3.63a.19.19,0,0,1-.12.17.2.2,0,0,1-.21,0c-.82-.7-2.18-2-2-3A.43.43,0,0,1,422.15,400.08Zm1.93,2.53c-.08-1.12-.33-2.6-.81-2.88a.34.34,0,0,0-.3,0,.71.71,0,0,0-.46.52C422.44,400.77,423,401.64,424.08,402.61Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M424.27,401.78c.23-.85.67-1.77,1.22-2a.72.72,0,0,1,.83.23.94.94,0,0,1,.26.78c-.14,1.1-2.08,2.34-2.17,2.39a.18.18,0,0,1-.19,0,.16.16,0,0,1-.11-.15A3.79,3.79,0,0,1,424.27,401.78Zm1.9-.91s0-.07,0-.11a.57.57,0,0,0-.17-.49c-.16-.18-.28-.17-.37-.13-.53.2-1.09,1.62-1.16,2.55A4.62,4.62,0,0,0,426.17,400.87Z"
        style={{ fill: '#407BFF' }}
      />
      <polygon
        points="405.48 402.34 411.18 394.05 419.1 400.94 412.56 408.51 405.48 402.34"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M322.81,392.89s43.7-44.4,63.37-25.4c12.25,11.84,30.25,28.15,30.25,28.15L406,405.79s-26.42-14.05-33.3-21.81c-36.1,40.36-68.36,43.12-65.46,12A122,122,0,0,1,322.81,392.89Z"
        style={{ fill: '#407BFF' }}
      />
      <polygon
        points="419.54 395.73 408.08 410.13 403.22 406.87 414.93 391.58 419.54 395.73"
        style={{ fill: '#263238' }}
      />
      <path
        d="M307.35,338.61l.86,18.2c.16,3,.35,6,.58,9,.12,1.47.28,2.92.44,4.31.09.7.18,1.38.29,2s.23,1.2.31,1.55a.94.94,0,0,1,0,.16,2.14,2.14,0,0,0-.68-.74,1.7,1.7,0,0,0-.54-.26c-.11,0-.17,0-.12,0a5.67,5.67,0,0,0,2.45-.16,42.29,42.29,0,0,0,7.69-2.73c2.67-1.17,5.33-2.52,8-3.92s5.34-2.89,7.93-4.34l3.74,5a101,101,0,0,1-15.21,11.67c-1.39.85-2.83,1.67-4.35,2.44a34.77,34.77,0,0,1-4.93,2.08,20.83,20.83,0,0,1-2.95.74,13.77,13.77,0,0,1-3.73.18,9.8,9.8,0,0,1-2.36-.52,9.53,9.53,0,0,1-2.56-1.37,9.17,9.17,0,0,1-2.07-2.25,10,10,0,0,1-.68-1.23l-.38-.92a26.87,26.87,0,0,1-.89-2.91c-.22-.89-.4-1.72-.56-2.55-.33-1.65-.58-3.26-.8-4.85-.46-3.18-.79-6.32-1.07-9.45-.56-6.26-.89-12.45-1-18.74Z"
        style={{ fill: '#ffc3bd' }}
      />
      <path
        d="M304.28,326.88c-4.71.53-11.76,5-12,25.78l20.2-1.59S322,324.85,304.28,326.88Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M351.55,351.15l-7.5.49a2.23,2.23,0,0,0-1.86,1.68l-3.51,16.48a1.13,1.13,0,0,0,1.19,1.48l7.5-.49a2.21,2.21,0,0,0,1.86-1.68l3.51-16.48A1.13,1.13,0,0,0,351.55,351.15Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M335.17,361.29l6.21-2.16-1.53,9.73s-6.92,1.52-7.49-2.2l1-3.31A3.14,3.14,0,0,1,335.17,361.29Z"
        style={{ fill: '#ffc3bd' }}
      />
      <polygon
        points="348.48 359.95 345.79 368.61 339.85 368.86 341.38 359.13 348.48 359.95"
        style={{ fill: '#ffc3bd' }}
      />
    </g>
    <g id="freepik--character-1--inject-34">
      <path
        d="M133.38,156c-4.88-11.33,21.73-23.19,29.25-5.55,12.77,5.55-3.55,29.15.14,33.15s6.47-.85,6.47-.85,3.73,9.94-5.78,17.9c-8.52,7.15-34.15,9.09-34.21-5C129.17,177.33,139.78,170.85,133.38,156Z"
        style={{ fill: '#263238' }}
      />
      <polygon
        points="157.85 393.86 150.69 398.03 133.5 378.38 142.42 370.33 157.85 393.86"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M149.87,396.23l7.39-5.67a.63.63,0,0,1,.84,0L163,395.4a1.28,1.28,0,0,1-.23,1.9c-2.6,1.93-3.95,2.74-7.2,5.24-2,1.53-6,4.89-8.74,7s-4.82-.32-3.85-1.43c4.38-5,5.33-8,6-10.67A2.28,2.28,0,0,1,149.87,396.23Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M148.21,399.19a3.23,3.23,0,0,1-1.87.85,1,1,0,0,1-.82-.49.62.62,0,0,1,0-.59c.5-1,4.06-1.79,4.46-1.88a.2.2,0,0,1,.2.09.22.22,0,0,1,0,.22A14.62,14.62,0,0,1,148.21,399.19Zm-2.12-.37a.79.79,0,0,0-.25.28.21.21,0,0,0,0,.23.63.63,0,0,0,.53.33c.65,0,1.78-.74,3.06-2.08A10.9,10.9,0,0,0,146.09,398.82Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M150.09,397.41l-.08,0c-1,.27-3.57.13-4-.66-.09-.18-.12-.49.28-.86a1.53,1.53,0,0,1,1.05-.41c1.31,0,2.71,1.55,2.76,1.62a.17.17,0,0,1,0,.18A.22.22,0,0,1,150.09,397.41Zm-3.44-1.29-.09.08c-.26.24-.2.36-.18.4.24.48,2.07.71,3.21.55a4.05,4.05,0,0,0-2.26-1.25A1.09,1.09,0,0,0,146.65,396.12Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M131.82,197.08c-.47,2.15-1,4.09-1.6,6.1s-1.22,4-1.94,5.92a102.76,102.76,0,0,1-4.86,11.55l-1.47,2.8c-.53.92-1,1.84-1.6,2.75l-.86,1.35c-.3.46-.53.87-.94,1.41-.2.26-.4.52-.67.83a7.23,7.23,0,0,1-1.14,1.08,4.41,4.41,0,0,1-1.71.8,4.11,4.11,0,0,1-.88.1,3.62,3.62,0,0,1-1.07-.15,3.78,3.78,0,0,1-1.71-1,3.94,3.94,0,0,1-1-1.7,4.78,4.78,0,0,1-.19-.91,10.06,10.06,0,0,1,0-2.17c.07-.6.17-1.16.27-1.7.2-1.09.46-2.11.73-3.13a58.9,58.9,0,0,1,2-5.92l4,.88-.27,6c0,1-.06,1.94-.07,2.86,0,.46,0,.91,0,1.31a2.93,2.93,0,0,0,.12.85s0,0,0-.18a2.48,2.48,0,0,0-.62-1,3.25,3.25,0,0,0-1.4-.84,3.82,3.82,0,0,0-.88-.13,3.65,3.65,0,0,0-.7.08,3,3,0,0,0-1,.45c-.21.15-.13.07-.09,0l.23-.39,1.34-2.4c.45-.84.86-1.7,1.3-2.55l1.23-2.6c1.56-3.53,3-7.16,4.2-10.86.62-1.85,1.19-3.72,1.76-5.59s1.08-3.8,1.53-5.57Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M128.4,186.67c-2.9.47-7.5,18.9-7.5,18.9l6.69,5.15s6.71-13.32,7-19.31C134.79,187.07,130.59,186.32,128.4,186.67Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M117.91,216.86l-1.13-9.16-5.25,7.7a4.92,4.92,0,0,0,3.91,3.69Z"
        style={{ fill: '#ff8b7b' }}
      />
      <polygon
        points="154.6 409.41 146.6 409.68 145.07 381.76 156.17 381.92 154.6 409.41"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M146.06,407.13l9-.06a.58.58,0,0,1,.6.54l.54,7.09a1.41,1.41,0,0,1-1.38,1.43c-3.12,0-4.62-.21-8.56-.18-2.43,0-6,.29-9.34.32s-3.31-3.29-1.89-3.6c6.35-1.39,7.46-3.25,9.69-5A2.28,2.28,0,0,1,146.06,407.13Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M127.91,186.61s-4,1-4,48.33L156,237.78c1.61-13.19,2.91-21.3,13.54-47.72a90.29,90.29,0,0,0-13.33-3,100.43,100.43,0,0,0-14.56-1.29C135.25,185.78,127.91,186.61,127.91,186.61Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M163.17,196.1l1.71,5.83c-1.34,3.61-2.45,6.8-3.38,9.67A32.51,32.51,0,0,1,163.17,196.1Z"
        style={{ opacity: '0.2' }}
      />
      <polygon
        points="116.78 207.7 111.53 215.4 117.91 215.03 121.31 207.99 116.78 207.7"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M120.11,225.41l6-.09a1.4,1.4,0,0,0,1.36-1.59l-1.87-13.45a1.38,1.38,0,0,0-1.4-1.2l-6,.09a1.38,1.38,0,0,0-1.36,1.58l1.87,13.45A1.39,1.39,0,0,0,120.11,225.41Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M157.41,170.41c-1.69,4.64-4,13.2-1.25,16.64a61.89,61.89,0,0,1-15.9,9.65c-3.35-7.82,1.34-10.94,1.34-10.94,5.43-.79,5.93-4.71,5.61-8.46Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M135.43,165.09c-.84,13.89-9.19,17.87-7.23,25,2.77,10,14.07,2.17,14.07,2.17s-6.15,2-6.54-2.86c-.32-4,13.88-3.38,9.94-12.79C143.14,170.55,135.43,165.09,135.43,165.09Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M154.5,173.92l-7.28,3.38a14.57,14.57,0,0,1,0,2.64c1.52.14,5.46-1,6.95-3.46A3.71,3.71,0,0,0,154.5,173.92Z"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M158.67,157.35c.73,7.88,1.21,11.21-2.12,15.83-5,6.95-14.85,6.13-17.92-1.39-2.77-6.76-3.5-18.52,3.67-22.81A10.8,10.8,0,0,1,158.67,157.35Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M156.93,149.44c-6.22-4.27-11.39,3.93-.35,11.9S164,154.29,156.93,149.44Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M153.62,147.15c2.57,2.31-12.73,10.83-21.05,8s-1.64-9.18,1.39-10c-2.6,2.51,1.95,6.32,4.15,3.94S148.46,142.52,153.62,147.15Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M123.87,234.94s-16.93,71.69-15.44,89.79C110.16,345.89,133.3,380,133.3,380l10.63-9.65s-10.55-27.94-18.36-46.14c2.5-18.2,24.6-69.62,24.6-86.94Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M123.87,234.94s-16.93,71.69-15.44,89.79C110.16,345.89,133.3,380,133.3,380l10.63-9.65s-10.55-27.94-18.36-46.14c2.5-18.2,24.6-69.62,24.6-86.94Z"
        style={{ opacity: '0.6000000000000001' }}
      />
      <polygon
        points="145.89 371.79 133.33 381.15 130.11 378.7 143.89 367.83 145.89 371.79"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M136.4,266.47c-9.33,12.92-9.78,36.68-9.2,50,3.2-12.26,9.91-30.57,15.26-47.07C142.33,263.08,140.76,260.42,136.4,266.47Z"
        style={{ opacity: '0.2' }}
      />
      <path
        d="M129.89,235s6.2,61.91,8.27,82.81c2.46,24.81,6.07,64.6,6.07,64.6l11.94-.5s2.62-33.73.68-56c.35-29.5,4.7-69.61-.9-88.17Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M129.89,235s6.2,61.91,8.27,82.81c2.46,24.81,6.07,64.6,6.07,64.6l11.94-.5s2.62-33.73.68-56c.35-29.5,4.7-69.61-.9-88.17Z"
        style={{ opacity: '0.6000000000000001' }}
      />
      <polygon
        points="157.08 384.1 143.38 383.71 142.42 379.4 157.92 378.97 157.08 384.1"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M146.41,161.7c.1.63-.16,1.2-.58,1.27s-.83-.4-.93-1,.16-1.2.58-1.27S146.31,161.06,146.41,161.7Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M139.22,162.81c.1.64-.16,1.21-.58,1.27s-.83-.4-.93-1,.16-1.21.58-1.27S139.12,162.18,139.22,162.81Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M138.47,161.78l-1.59-.2S137.85,162.65,138.47,161.78Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M141.58,163.44a17.42,17.42,0,0,1-1.64,4.41,2.77,2.77,0,0,0,2.33.07Z"
        style={{ fill: '#ff5652' }}
      />
      <path
        d="M146.41,169.67a5.38,5.38,0,0,1-1,.25.19.19,0,0,1-.22-.15.19.19,0,0,1,.16-.22,5.06,5.06,0,0,0,3.8-2.61.2.2,0,0,1,.25-.09.19.19,0,0,1,.1.25A5.33,5.33,0,0,1,146.41,169.67Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M160.86,162.73a5.83,5.83,0,0,1-2,4c-1.54,1.32-3.17.16-3.46-1.75-.27-1.71.22-4.46,2.11-5A2.6,2.6,0,0,1,160.86,162.73Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M149.68,157.76a.38.38,0,0,1-.29-.06,3,3,0,0,0-2.7-.45.37.37,0,0,1-.49-.21.38.38,0,0,1,.21-.49,3.72,3.72,0,0,1,3.41.53.38.38,0,0,1,.1.52A.43.43,0,0,1,149.68,157.76Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M136.1,160.05a.34.34,0,0,1-.28,0,.37.37,0,0,1-.18-.5,3.73,3.73,0,0,1,2.67-2.18.38.38,0,0,1,.11.75,3,3,0,0,0-2.1,1.75A.36.36,0,0,1,136.1,160.05Z"
        style={{ fill: '#263238' }}
      />
      <path
        d="M171.65,199.66c.15,1.45.23,2.72.27,4.07s.07,2.65.06,4q-.06,4-.51,8a56.37,56.37,0,0,1-1.5,8,36.94,36.94,0,0,1-1.3,4c-.25.66-.53,1.32-.82,2,0,0-.15.32-.25.5a3.92,3.92,0,0,1-.37.59,5.71,5.71,0,0,1-.86,1,7.06,7.06,0,0,1-1.75,1.1,9.93,9.93,0,0,1-2.84.72,17.46,17.46,0,0,1-2.35.1,35.05,35.05,0,0,1-4.22-.37,70.81,70.81,0,0,1-7.77-1.68c-2.51-.69-5-1.45-7.43-2.26s-4.85-1.71-7.26-2.72l1.25-3.84c2.43.53,4.9,1.09,7.36,1.56s4.91,1,7.35,1.36,4.88.73,7.24.88a27.77,27.77,0,0,0,3.39.06,11.5,11.5,0,0,0,1.44-.16,2.94,2.94,0,0,0,.83-.26s0,0-.15.08a1.16,1.16,0,0,0-.24.25l-.12.18s-.09.2,0,.07c.19-.52.38-1,.54-1.58.34-1.08.62-2.19.87-3.32a61.11,61.11,0,0,0,1-7c.22-2.38.29-4.8.29-7.22,0-1.21,0-2.42,0-3.63s-.11-2.46-.18-3.54Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M169.46,190.06c3.45,2.25,2.28,21.86,2.28,21.86l-8.12,1.63s-.07-10-.94-16.49C162.09,192.65,167,188.45,169.46,190.06Z"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M141.66,408.06a1.05,1.05,0,0,1-.17-.92.7.7,0,0,1,.41-.53c1-.43,3.28,1.12,3.54,1.29a.18.18,0,0,1,.07.19.22.22,0,0,1-.15.16c-1.05.25-2.92.57-3.62-.11Zm3.18-.08c-1-.59-2.3-1.26-2.81-1a.3.3,0,0,0-.17.24.68.68,0,0,0,.15.67C142.39,408.23,143.43,408.27,144.84,408Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M144.28,407.35a3.05,3.05,0,0,1-.89-2.16.74.74,0,0,1,.68-.53.93.93,0,0,1,.78.24c.81.76.67,3.06.66,3.16a.21.21,0,0,1-.1.17.21.21,0,0,1-.19,0A4.11,4.11,0,0,1,144.28,407.35Zm.38-2.08a.6.6,0,0,0-.08-.08.59.59,0,0,0-.49-.16c-.25,0-.3.14-.33.23-.15.55.67,1.84,1.39,2.44A4.52,4.52,0,0,0,144.66,405.27Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M156.74,235.92l.35,3c.08.23-.22.44-.59.4l-33-2.92c-.29,0-.51-.19-.5-.37l.19-2.92c0-.2.29-.35.6-.32l32.49,2.88A.53.53,0,0,1,156.74,235.92Z"
        style={{ fill: '#fff' }}
      />
      <path
        d="M151.78,239.2l.87.07c.18,0,.32-.06.33-.17l.2-3.79c0-.11-.13-.22-.3-.23L152,235c-.17,0-.32.06-.33.17l-.2,3.8C151.47,239.08,151.61,239.18,151.78,239.2Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M151.78,239.2l.87.07c.18,0,.32-.06.33-.17l.2-3.79c0-.11-.13-.22-.3-.23L152,235c-.17,0-.32.06-.33.17l-.2,3.8C151.47,239.08,151.61,239.18,151.78,239.2Z"
        style={{ opacity: '0.6000000000000001' }}
      />
      <path
        d="M125.87,236.9l.87.08c.18,0,.32-.06.33-.17l.2-3.8c0-.11-.13-.21-.3-.23l-.87-.07c-.18,0-.32.06-.33.17l-.2,3.79C125.56,236.78,125.7,236.89,125.87,236.9Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M125.87,236.9l.87.08c.18,0,.32-.06.33-.17l.2-3.8c0-.11-.13-.21-.3-.23l-.87-.07c-.18,0-.32.06-.33.17l-.2,3.79C125.56,236.78,125.7,236.89,125.87,236.9Z"
        style={{ opacity: '0.6000000000000001' }}
      />
      <path
        d="M138.83,238.05l.87.08c.17,0,.32-.07.32-.18l.21-3.79c0-.11-.13-.21-.31-.23l-.87-.08c-.17,0-.32.07-.32.18l-.21,3.79C138.52,237.93,138.66,238,138.83,238.05Z"
        style={{ fill: '#407BFF' }}
      />
      <path
        d="M138.83,238.05l.87.08c.17,0,.32-.07.32-.18l.21-3.79c0-.11-.13-.21-.31-.23l-.87-.08c-.17,0-.32.07-.32.18l-.21,3.79C138.52,237.93,138.66,238,138.83,238.05Z"
        style={{ opacity: '0.6000000000000001' }}
      />
      <path
        d="M135.25,223.11l-5-6.67-2.08,8s3.72,3.25,6.88,2Z"
        style={{ fill: '#ff8b7b' }}
      />
      <polygon
        points="123.85 214.97 122.46 221.72 129.21 225.17 130.28 216.44 123.85 214.97"
        style={{ fill: '#ff8b7b' }}
      />
      <path
        d="M145.67,160.67l-1.6-.2S145,161.54,145.67,160.67Z"
        style={{ fill: '#263238' }}
      />
    </g>
  </svg>
)