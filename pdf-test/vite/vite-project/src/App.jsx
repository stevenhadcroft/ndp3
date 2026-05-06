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
  `${base}docs/NDP3 Therapy resoures index.pdf`,
]

const params = new URLSearchParams(window.location.search)
const index  = Math.min(Math.max(parseInt(params.get('doc') ?? '0', 10), 0), docs.length - 1)

export default function App() {
  return <PdfViewer url={docs[index]} />
}
