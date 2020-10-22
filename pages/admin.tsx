import Head from 'next/head'
import { FC } from 'react'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { buildDataProvider, buildAuthProvider } from 'react-admin-amplify'
import {
  Resource,
  Admin,
  GetOneParams,
  GetListParams,
  UpdateParams,
  DataProvider
} from 'react-admin'
import * as mutations from '../api/graphql/mutations'
import * as queries from '../api/graphql/queries'
import {
  SessionList,
  SessionEdit,
  SessionCreate
} from '../components/Admin/Session'
import japaneseMessages from '@bicstone/ra-language-japanese'
import polyglotI18nProvider from 'ra-i18n-polyglot'
import dynamic from 'next/dynamic'
import { Session } from '../@types/session'

const i18nProvider = polyglotI18nProvider(() => japaneseMessages)

const sessionParse = (data: Session<string, string>): Session => {
  const proposals = data.proposals ? JSON.parse(data.proposals) : []
  const theme = data.theme ? JSON.parse(data.theme) : {}
  return { ...data, proposals, theme }
}

const sessionFormat = (data: Session): Session<string, string> => {
  const proposals = data.proposals ? JSON.stringify(data.proposals) : '[]'
  const theme = data.theme ? JSON.stringify(data.theme) : '{}'
  return { ...data, proposals, theme }
}

const defaultDataProvider = buildDataProvider({ queries, mutations })
const dataProvider = {
  ...defaultDataProvider,
  getList: async (resource: string, params: GetListParams) => {
    const result = await defaultDataProvider.getList(resource, params)
    if (resource !== 'sessions') return result
    return {
      ...result,
      data: result.data.map((item) =>
        sessionParse(item as Session<string, string>)
      )
    }
  },
  getOne: async (resource: string, params: GetOneParams) => {
    const result = await defaultDataProvider.getOne(resource, params)
    if (resource !== 'sessions') return result
    return {
      ...result,
      data: sessionParse(result.data as Session<string, string>)
    }
  },
  update: async (resource: string, params: UpdateParams) => {
    const newParams =
      resource === 'sessions'
        ? { ...params, data: sessionFormat(params.data as Session) }
        : params
    const result = await defaultDataProvider.update(resource, newParams)
    if (resource !== 'sessions') return result
    return {
      ...result,
      data: sessionParse(result.data as Session<string, string>)
    }
  }
} as DataProvider

const App: FC = () => {
  return (
    <>
      <Head>
        <title>botui admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Admin
        dataProvider={dataProvider}
        authProvider={buildAuthProvider()}
        i18nProvider={i18nProvider}
      >
        <Resource
          name="sessions"
          options={{ label: 'セッション' }}
          list={SessionList}
          edit={SessionEdit}
          create={SessionCreate}
        />
      </Admin>
    </>
  )
}

const AppWithAuthenticator = withAuthenticator(App, { usernameAlias: 'email' })
export default dynamic(() => Promise.resolve(AppWithAuthenticator), {
  ssr: false
})
