import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  base: '/dev/ndp3v2/pdf-viewer/',
  plugins: [
    react(),
    {
      name: 'serve-docs',
      configureServer(server) {
        const docsDir = path.resolve(__dirname, '../../../docs')
        server.middlewares.use('/dev/ndp3v2/pdf-viewer/docs', (req, res, next) => {
          const filePath = path.join(docsDir, decodeURIComponent(req.url))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/pdf')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      }
    }
  ],
})
