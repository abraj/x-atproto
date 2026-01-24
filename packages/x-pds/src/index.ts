import 'dotenv/config'
import events from 'node:events'
import express from 'express'
import {
  AppContext,
  // PDS,
  envToCfg,
  envToSecrets,
  httpLogger,
  readEnv,
} from '@atproto/pds'
import * as authRoutes from './auth-routes'
// import pkg from '@atproto/pds/package.json'

const main = async () => {
  const env = readEnv()
  // env.version ||= pkg.version
  const cfg = envToCfg(env)
  const secrets = envToSecrets(env)

  console.log('----->> create: 1.4..')
  const ctx = await AppContext.fromConfig(cfg, secrets)

  const app = express()
  app.use(authRoutes.createRouter(ctx)) // Before CORS
  const server = app.listen(ctx.cfg.service.port)
  await events.once(server, 'listening')

  // const pds = await PDS.create(cfg, secrets)
  // await pds.start()

  // httpLogger.info('pds has started')
  // pds.app.get('/tls-check', (req, res) => {
  //   checkHandleRoute(pds, req, res)
  // })
  // Graceful shutdown (see also https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/)
  process.on('SIGTERM', async () => {
    httpLogger.info('pds is stopping')
    // await pds.destroy()
    httpLogger.info('pds is stopped')
  })
}

// async function checkHandleRoute(
//   pds: PDS,
//   req: express.Request,
//   res: express.Response,
// ) {
//   try {
//     const { domain } = req.query
//     if (!domain || typeof domain !== 'string') {
//       return res.status(400).json({
//         error: 'InvalidRequest',
//         message: 'bad or missing domain query param',
//       })
//     }
//     if (domain === pds.ctx.cfg.service.hostname) {
//       return res.json({ success: true })
//     }
//     const isHostedHandle = pds.ctx.cfg.identity.serviceHandleDomains.find(
//       (avail) => domain.endsWith(avail),
//     )
//     if (!isHostedHandle) {
//       return res.status(400).json({
//         error: 'InvalidRequest',
//         message: 'handles are not provided on this domain',
//       })
//     }
//     const account = await pds.ctx.accountManager.getAccount(domain)
//     if (!account) {
//       return res.status(404).json({
//         error: 'NotFound',
//         message: 'handle not found for this domain',
//       })
//     }
//     return res.json({ success: true })
//   } catch (err) {
//     httpLogger.error({ err }, 'check handle failed')
//     return res.status(500).json({
//       error: 'InternalServerError',
//       message: 'Internal Server Error',
//     })
//   }
// }

main()
