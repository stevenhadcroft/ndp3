import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './PdfViewer.css'
import { metaphone, PHONETIC_SYMBOLS } from './phonetics'
import { printPdf } from './print'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const THUMB_W        = 118
const ZOOM_STEP      = 0.15
const ZOOM_MIN       = 0.5
const ZOOM_MAX       = 4
const SIDEBAR_MIN    = 60
const SIDEBAR_MAX    = 580
const SIDEBAR_DEFAULT = 166

export default function PdfViewer({ url }) {
  const [pdfDoc, setPdfDoc]           = useState(null)
  const [, setNumPages]               = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [thumbnails, setThumbnails]   = useState([])
  const [zoom, setZoom]               = useState(1)

  const [sidebarW, setSidebarW]           = useState(() => {
    const saved = localStorage.getItem('pdf-sidebar-width')
    return saved ? Number(saved) : SIDEBAR_DEFAULT
  })

  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchTerm, setSearchTerm]       = useState('')
  const [phoneticMode, setPhoneticMode]   = useState(false)
  const [searchResults, setSearchResults] = useState([]) // [{page, items: [{item, startIdx, length}]}]
  const [activeMatch, setActiveMatch]     = useState(0)  // flat index across all results
  const [pageTexts, setPageTexts]         = useState([]) // [{page, items: [{str, transform, width, height}]}]

  const mainCanvasRef  = useRef(null)
  const mainAreaRef    = useRef(null)
  const highlightRef   = useRef(null)
  const renderTaskRef  = useRef(null)
  const currentPageRef = useRef(1)
  const zoomRef        = useRef(1)
  const searchInputRef = useRef(null)

  useEffect(() => { currentPageRef.current = currentPage }, [currentPage])
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  // Load PDF
  useEffect(() => {
    let cancelled = false
    pdfjsLib.getDocument(url).promise.then(doc => {
      if (cancelled) return
      setPdfDoc(doc)
      setNumPages(doc.numPages)
      setCurrentPage(1)
      setThumbnails([])
      setZoom(1)
      setPageTexts([])
      setSearchResults([])
      setSearchTerm('')
    })
    return () => { cancelled = true }
  }, [url])

  // Extract text content from all pages
  useEffect(() => {
    if (!pdfDoc) return
    let cancelled = false

    async function extractText() {
      const texts = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) return
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        const viewport = page.getViewport({ scale: 1 })
        texts.push({
          page: i,
          viewport,
          items: content.items.map(item => ({
            str: item.str,
            transform: item.transform,
            width: item.width,
            height: item.height,
            fontName: item.fontName,
          })),
          styles: content.styles,
        })
      }
      if (!cancelled) setPageTexts(texts)
    }

    extractText()
    return () => { cancelled = true }
  }, [pdfDoc])

  // Search logic
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2 || pageTexts.length === 0) {
      setSearchResults([])
      setActiveMatch(0)
      return
    }
    const term = searchTerm.toLowerCase()
    const results = []

    if (phoneticMode) {
      const termCode = metaphone(searchTerm)
      if (!termCode) { setSearchResults([]); setActiveMatch(0); return }

      const wordRegex = /[a-zA-Z]+/g
      for (const pageData of pageTexts) {
        const pageMatches = []
        for (const item of pageData.items) {
          let match
          wordRegex.lastIndex = 0
          while ((match = wordRegex.exec(item.str)) !== null) {
            const wordCode = metaphone(match[0])
            if (wordCode === termCode) {
              pageMatches.push({ item, startIdx: match.index, length: match[0].length })
            }
          }
        }
        if (pageMatches.length > 0) {
          results.push({ page: pageData.page, viewport: pageData.viewport, styles: pageData.styles, items: pageMatches })
        }
      }
    } else {
      for (const pageData of pageTexts) {
        const pageMatches = []
        for (const item of pageData.items) {
          const str = item.str.toLowerCase()
          let idx = str.indexOf(term)
          while (idx !== -1) {
            pageMatches.push({ item, startIdx: idx, length: term.length })
            idx = str.indexOf(term, idx + 1)
          }
        }
        if (pageMatches.length > 0) {
          results.push({ page: pageData.page, viewport: pageData.viewport, styles: pageData.styles, items: pageMatches })
        }
      }
    }

    setSearchResults(results)
    setActiveMatch(0)
  }, [searchTerm, pageTexts, phoneticMode])

  // Flatten results for navigation
  const flatMatches = searchResults.flatMap(r =>
    r.items.map(item => ({ page: r.page, viewport: r.viewport, ...item }))
  )
  const totalMatches = flatMatches.length

  // Navigate to active match page
  useEffect(() => {
    if (flatMatches.length > 0 && activeMatch < flatMatches.length) {
      const match = flatMatches[activeMatch]
      if (match.page !== currentPageRef.current) {
        setCurrentPage(match.page)
      }
    }
  }, [activeMatch, flatMatches])

  const goNextMatch = () => {
    if (totalMatches === 0) return
    setActiveMatch(i => (i + 1) % totalMatches)
  }
  const goPrevMatch = () => {
    if (totalMatches === 0) return
    setActiveMatch(i => (i - 1 + totalMatches) % totalMatches)
  }

  // Ctrl+F to toggle search
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(open => {
          const next = !open
          if (!next) {
            setSearchTerm('')
            setSearchResults([])
          }
          return next
        })
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchTerm('')
        setSearchResults([])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchOpen])

  // Render thumbnails
  useEffect(() => {
    if (!pdfDoc) return
    let cancelled = false

    async function buildThumbnails() {
      const thumbs = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) return
        const page     = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        const scale    = THUMB_W / viewport.width
        const scaled   = page.getViewport({ scale })

        const canvas  = document.createElement('canvas')
        canvas.width  = scaled.width
        canvas.height = scaled.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise

        thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL() })
        if (!cancelled) setThumbnails([...thumbs])
      }
    }

    buildThumbnails()
    return () => { cancelled = true }
  }, [pdfDoc])

  // Render main page at fit-height × zoom
  const renderPage = useCallback(async (doc, pageNum, zoomLevel) => {
    if (!doc || !mainCanvasRef.current || !mainAreaRef.current) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const page       = await doc.getPage(pageNum)
    const naturalVp  = page.getViewport({ scale: 1 })
    const containerH = mainAreaRef.current.clientHeight - 16
    const fitScale   = containerH / naturalVp.height
    const scale      = fitScale * zoomLevel
    const dpr        = window.devicePixelRatio || 1
    const viewport   = page.getViewport({ scale: scale * dpr })
    const canvas     = mainCanvasRef.current
    canvas.width     = viewport.width
    canvas.height    = viewport.height
    canvas.style.width  = (viewport.width / dpr) + 'px'
    canvas.style.height = (viewport.height / dpr) + 'px'
    const task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
    renderTaskRef.current = task
    task.promise.catch(() => {})

    // Size highlight overlay to match CSS size of canvas
    if (highlightRef.current) {
      highlightRef.current.style.width  = (viewport.width / dpr) + 'px'
      highlightRef.current.style.height = (viewport.height / dpr) + 'px'
    }
  }, [])

  useEffect(() => {
    renderPage(pdfDoc, currentPage, zoom)
  }, [pdfDoc, currentPage, zoom, renderPage])

  // Re-render on window resize
  useEffect(() => {
    const onResize = () => renderPage(pdfDoc, currentPageRef.current, zoomRef.current)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [pdfDoc, renderPage])

  // Render search highlights on current page
  useEffect(() => {
    const overlay = highlightRef.current
    if (!overlay) return
    // Clear old highlights
    overlay.innerHTML = ''

    if (!searchTerm || searchResults.length === 0 || !pdfDoc || !mainAreaRef.current) return

    const pageResult = searchResults.find(r => r.page === currentPage)
    if (!pageResult) return

    const naturalVp  = pageResult.viewport
    const containerH = mainAreaRef.current.clientHeight - 16
    const fitScale   = containerH / naturalVp.height
    // Use CSS scale (not canvas scale) since overlay matches CSS-sized canvas
    const scale      = fitScale * zoom

    // Figure out which flat indices belong to this page for active highlight
    let flatIdxOffset = 0
    for (const r of searchResults) {
      if (r.page === currentPage) break
      flatIdxOffset += r.items.length
    }

    // Shared canvas for measuring text widths
    const measureCanvas = document.createElement('canvas')
    const measureCtx = measureCanvas.getContext('2d')

    pageResult.items.forEach((match, i) => {
      const { item, startIdx, length } = match
      const tx = item.transform[4]
      const ty = item.transform[5]
      // Use transform matrix for accurate font metrics
      const scaleX = item.transform[0]
      const scaleY = Math.abs(item.transform[3])
      const fontHeight = scaleY || item.height

      // Get font family from styles if available
      const style = pageResult.styles?.[item.fontName]
      const fontFamily = style?.fontFamily || 'sans-serif'
      measureCtx.font = `${scaleY}px ${fontFamily}`

      // Measure the prefix (before match) and the match itself
      const prefixStr = item.str.substring(0, startIdx)
      const matchStr = item.str.substring(startIdx, startIdx + length)
      const fullMeasured = measureCtx.measureText(item.str).width
      const prefixMeasured = measureCtx.measureText(prefixStr).width
      const matchMeasured = measureCtx.measureText(matchStr).width

      // Scale measurement to PDF coordinate width using the actual item width
      const ratio = fullMeasured > 0 ? item.width / fullMeasured : 1
      const offsetX = prefixMeasured * ratio
      const matchW = matchMeasured * ratio

      // PDF coords: origin bottom-left → convert to top-left CSS coords
      const x = (tx + offsetX) * scale
      const y = (naturalVp.height - ty - fontHeight) * scale
      const w = matchW * scale
      const h = fontHeight * scale

      const div = document.createElement('div')
      div.className = 'pdf-search-highlight'
      const isActive = (flatIdxOffset + i) === activeMatch
      if (isActive) div.classList.add('active')
      const padX = 2 * scale
      const padY = 2 * scale
      div.style.left   = (x - padX) + 'px'
      div.style.top    = y + 'px'
      div.style.width  = (w + padX * 2) + 'px'
      div.style.height = (h + padY * 2) + 'px'
      overlay.appendChild(div)

      if (isActive) {
        div.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    })
  }, [searchResults, currentPage, activeMatch, zoom, pdfDoc, searchTerm])

  // Scroll wheel zoom
  useEffect(() => {
    const el = mainAreaRef.current
    if (!el) return
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const changeZoom = (delta) =>
    setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)))

  const activeThumbRef = useRef(null)

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentPage])

  // Sidebar drag-resize
  const startSidebarDrag = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarW
    let lastW = startW
    const onMove = (ev) => {
      lastW = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW + ev.clientX - startX))
      setSidebarW(lastW)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem('pdf-sidebar-width', String(lastW))
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarW])

  const handlePrint = () => printPdf(url)

  const sidebarCols = sidebarW >= 446 ? 4 : sidebarW >= 330 ? 3 : sidebarW >= 215 ? 2 : 1

  const handleSidebarKeyDown = (e) => {
    if (!pdfDoc) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCurrentPage(p => Math.min(pdfDoc.numPages, p + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCurrentPage(p => Math.max(1, p - 1))
    }
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-body">
        <div className="pdf-sidebar" style={{ width: sidebarW, gridTemplateColumns: `repeat(${sidebarCols}, 1fr)` }} tabIndex={0} onKeyDown={handleSidebarKeyDown}>
          {thumbnails.map(({ pageNum, dataUrl }) => (
            <div
              key={pageNum}
              ref={pageNum === currentPage ? activeThumbRef : null}
              className={`pdf-thumb${pageNum === currentPage ? ' active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              <img src={dataUrl} alt={`Page ${pageNum}`} />
              <span className="pdf-thumb-label">{pageNum}</span>
            </div>
          ))}
        </div>
        <div className="pdf-sidebar-handle" onMouseDown={startSidebarDrag}>
          <div className="pdf-sidebar-handle-tab" onMouseDown={startSidebarDrag}>
            <svg width="14" height="36" viewBox="0 0 14 36" fill="currentColor">
              <circle cx="4" cy="3" r="1.5"/>
              <circle cx="10" cy="3" r="1.5"/>
              <circle cx="4" cy="9" r="1.5"/>
              <circle cx="10" cy="9" r="1.5"/>
              <circle cx="4" cy="15" r="1.5"/>
              <circle cx="10" cy="15" r="1.5"/>
              <circle cx="4" cy="21" r="1.5"/>
              <circle cx="10" cy="21" r="1.5"/>
              <circle cx="4" cy="27" r="1.5"/>
              <circle cx="10" cy="27" r="1.5"/>
              <circle cx="4" cy="33" r="1.5"/>
              <circle cx="10" cy="33" r="1.5"/>
            </svg>
          </div>
        </div>

        <div className="pdf-main" ref={mainAreaRef}>
          {!pdfDoc && <p className="pdf-placeholder">Loading…</p>}
          <div className="pdf-canvas-wrapper">
            <canvas ref={mainCanvasRef} className="pdf-canvas" />
            <div ref={highlightRef} className="pdf-highlight-overlay" />
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="pdf-search-panel">
          <div className="pdf-search-bar">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={phoneticMode ? "Phonetic search…" : "Search in PDF…"}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.shiftKey ? goPrevMatch() : goNextMatch()
                }
                if (e.key === 'Escape') {
                  setSearchOpen(false)
                  setSearchTerm('')
                  setSearchResults([])
                }
              }}
            />
            <span className="pdf-search-count">
              {totalMatches > 0 ? `${activeMatch + 1} / ${totalMatches}` : searchTerm.length >= 2 ? 'No results' : ''}
            </span>
            <button
              title="Phonetic keyboard"
              className={`phonetic-toggle ${phoneticMode ? 'phonetic-active' : ''}`}
              onClick={() => setPhoneticMode(m => !m)}
            >
              ʊ
            </button>
            <button title="Previous match" onClick={goPrevMatch} disabled={totalMatches === 0}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
            <button title="Next match" onClick={goNextMatch} disabled={totalMatches === 0}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button title="Close search" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults([]) }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {phoneticMode && (
            <div className="phonetic-grid">
              {PHONETIC_SYMBOLS.map((sym, i) => sym === null
                ? <div key={i} className="phonetic-spacer" />
                : <button
                    key={i}
                    className="phonetic-btn"
                    onClick={() => {
                      setSearchTerm(t => t + sym)
                      searchInputRef.current?.focus()
                    }}
                  >
                    {sym}
                  </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="zoom-controls">
        <button title="Zoom out" onClick={() => changeZoom(-ZOOM_STEP)}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button title="Reset zoom" onClick={() => setZoom(1)}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <polyline points="21 15 21 21 15 21"/>
            <polyline points="3 9 3 3 9 3"/>
          </svg>
        </button>
        <button title="Zoom in" onClick={() => changeZoom(ZOOM_STEP)}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button title="Search (Ctrl+F)" onClick={() => { setSearchOpen(o => !o); setTimeout(() => searchInputRef.current?.focus(), 50) }}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        <button title="Print PDF" onClick={handlePrint}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
