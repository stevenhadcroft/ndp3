export function printPdf(url) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '-9999px'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.src = url
  document.body.appendChild(iframe)

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.print()
    }, 300)
  }

  // Clean up after printing
  window.addEventListener('afterprint', () => {
    iframe.remove()
  }, { once: true })
}
