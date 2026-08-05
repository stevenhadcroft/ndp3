import { useState } from 'react'
import PdfViewer from './PdfViewer'

const base = import.meta.env.BASE_URL

const docs = [
  `${base}docs/NDP3 Articulogram cards.pdf`,
  `${base}docs/NDP3 Articulogram instructions.pdf`,
  `${base}docs/NDP3 Articulogram worksheets.pdf`,
  `${base}docs/NDP3 Assessment flip-book 1 CV and VC words.pdf`,
  `${base}docs/NDP3 Assessment flip-book 2 CVC words.pdf`,
  `${base}docs/NDP3 Assessment flip-book 3 CVCV words.pdf`,
  `${base}docs/NDP3 Assessment flip-book 4 Multisyllabic words.pdf`,
  `${base}docs/NDP3 Assessment flip-book 6 Phrases and sentences.pdf`,
  `${base}docs/NDP3 Assessment flip-book 7 Zoo Story re-tell.pdf`,
  `${base}docs/NDP3 Assessment forms.pdf`,
  `${base}docs/NDP3 Assessment guidance.pdf`,
  `${base}docs/NDP3 Therapy manual.pdf`,
  `${base}docs/NDP3 Therapy resources worksheets full.pdf`,
  `${base}docs/NDP3 Therapy resources index.pdf`,
]

  
  
// Groups of related documents. Whenever the open doc belongs to a group, a
// dropdown lets the user switch to any sibling within that same group.
const docGroups = [
  [
    { label: 'Flip-book 1: CV and VC words',          url: `${base}docs/NDP3 Assessment flip-book 1 CV and VC words.pdf` },
    { label: 'Flip-book 2: CVC words',                url: `${base}docs/NDP3 Assessment flip-book 2 CVC words.pdf` },
    { label: 'Flip-book 3: CVCV words',               url: `${base}docs/NDP3 Assessment flip-book 3 CVCV words.pdf` },
    { label: 'Flip-book 4: Multisyllabic words',      url: `${base}docs/NDP3 Assessment flip-book 4 Multisyllabic words.pdf` },
    { label: 'Flip-book 6: Phrases and sentences',    url: `${base}docs/NDP3 Assessment flip-book 6 Phrases and sentences.pdf` },
    { label: 'Flip-book 7: Zoo Story re-tell',        url: `${base}docs/NDP3 Assessment flip-book 7 Zoo Story re-tell.pdf` },
    { label: 'NDP3 Assessment forms',                 url: `${base}docs/NDP3 Assessment forms.pdf` },
    { label: 'NDP3 Assessment guidance',              url: `${base}docs/NDP3 Assessment guidance.pdf` },
  ],
  [
    { label: 'Therapy resources worksheets full',     url: `${base}docs/NDP3 Therapy resources worksheets full.pdf` },
    { label: 'Therapy resources index',               url: `${base}docs/NDP3 Therapy resources index.pdf` },
  ],
  [
    { label: 'Articulogram cards',                    url: `${base}docs/NDP3 Articulogram cards.pdf` },
    { label: 'Articulogram instructions',              url: `${base}docs/NDP3 Articulogram instructions.pdf` },
    { label: 'Articulogram worksheets',                url: `${base}docs/NDP3 Articulogram worksheets.pdf` },
  ],
]

const params = new URLSearchParams(window.location.search)

function resolveDoc() {
  const file = params.get('file')
  if (file) {
    const match = docs.find((d) => d.toLowerCase().includes(file.toLowerCase()))
    if (match) return match
  }
  const index = Math.min(Math.max(parseInt(params.get('doc') ?? '0', 10), 0), docs.length - 1)
  return docs[index]
}

const title = params.get('title') ?? ''
const isElectron = params.get('electron') === '1'

function closeViewer() {
  window.parent.postMessage({ type: 'ndp3-pdf-viewer-close' }, window.location.origin)
}

export default function App() {
  const [url, setUrl] = useState(resolveDoc)
  const group = docGroups.find((g) => g.some((d) => d.url === url))

  return (
    <PdfViewer
      url={url}
      title={title}
      onClose={closeViewer}
      docOptions={group}
      onSelectDoc={setUrl}
      isElectron={isElectron}
    />
  )
}
