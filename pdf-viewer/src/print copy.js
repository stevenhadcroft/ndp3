export async function printPage(pdfDoc, pageNum) {
  if (!pdfDoc) return
  const page = await pdfDoc.getPage(pageNum)
  const printScale = 4
  const viewport = page.getViewport({ scale: printScale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  const dataUrl = canvas.toDataURL('image/png')
  const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait'
  const w = window.open('')
  if (!w) return
  w.document.write(
    `<html><head><title>Print Page ${pageNum}</title><style>` +
    `@media print { @page { size: ${orientation}; margin: 0; } body { margin: 0; } }` +
    `body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }` +
    `img { max-width: 100%; max-height: 100vh; }` +
    `</style></head><body>` +
    `<img src="${dataUrl}" />` +
    `</body></html>`
  )
  w.document.close()
  w.addEventListener('load', () => {
    setTimeout(() => { w.print(); w.close() }, 500)
  })
}
