import { useEffect, useRef, useState, useMemo } from 'react'
import { metaphone, PHONETIC_SYMBOLS } from './phonetics'

// Custom hook for all PDF search state and logic
export function useSearch(pdfDoc, currentPage, setCurrentPage, currentPageRef, zoom, mainAreaRef, highlightRef) {
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchTerm, setSearchTerm]       = useState('')
  const [phoneticMode, setPhoneticMode]   = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [activeMatch, setActiveMatch]     = useState(0)
  const [pageTexts, setPageTexts]         = useState([])
  const searchInputRef = useRef(null)

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
  const flatMatches = useMemo(() =>
    searchResults.flatMap(r =>
      r.items.map(item => ({ page: r.page, viewport: r.viewport, ...item }))
    ), [searchResults])
  const totalMatches = flatMatches.length

  // Navigate to active match page
  useEffect(() => {
    if (flatMatches.length > 0 && activeMatch < flatMatches.length) {
      const match = flatMatches[activeMatch]
      if (match.page !== currentPageRef.current) {
        setCurrentPage(match.page)
      }
    }
  }, [activeMatch, flatMatches, currentPageRef, setCurrentPage])

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

  // Render search highlights on current page
  useEffect(() => {
    const overlay = highlightRef.current
    if (!overlay) return
    overlay.innerHTML = ''

    if (!searchTerm || searchResults.length === 0 || !pdfDoc || !mainAreaRef.current) return

    const pageResult = searchResults.find(r => r.page === currentPage)
    if (!pageResult) return

    const naturalVp  = pageResult.viewport
    const containerH = mainAreaRef.current.clientHeight - 16
    const fitScale   = containerH / naturalVp.height
    const scale      = fitScale * zoom

    let flatIdxOffset = 0
    for (const r of searchResults) {
      if (r.page === currentPage) break
      flatIdxOffset += r.items.length
    }

    const measureCanvas = document.createElement('canvas')
    const measureCtx = measureCanvas.getContext('2d')

    pageResult.items.forEach((match, i) => {
      const { item, startIdx, length } = match
      const tx = item.transform[4]
      const ty = item.transform[5]
      const scaleX = item.transform[0]
      const scaleY = Math.abs(item.transform[3])
      const fontHeight = scaleY || item.height

      const style = pageResult.styles?.[item.fontName]
      const fontFamily = style?.fontFamily || 'sans-serif'
      measureCtx.font = `${scaleY}px ${fontFamily}`

      const prefixStr = item.str.substring(0, startIdx)
      const matchStr = item.str.substring(startIdx, startIdx + length)
      const fullMeasured = measureCtx.measureText(item.str).width
      const prefixMeasured = measureCtx.measureText(prefixStr).width
      const matchMeasured = measureCtx.measureText(matchStr).width

      const ratio = fullMeasured > 0 ? item.width / fullMeasured : 1
      const offsetX = prefixMeasured * ratio
      const matchW = matchMeasured * ratio

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
  }, [searchResults, currentPage, activeMatch, zoom, pdfDoc, searchTerm, highlightRef, mainAreaRef])

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchTerm('')
    setSearchResults([])
  }

  const openSearch = () => {
    setSearchOpen(o => !o)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  return {
    searchOpen, searchTerm, setSearchTerm, phoneticMode, setPhoneticMode,
    totalMatches, activeMatch, goNextMatch, goPrevMatch,
    searchInputRef, closeSearch, openSearch,
    resetSearch: () => { setPageTexts([]); setSearchResults([]); setSearchTerm('') },
  }
}

// Search panel component
export function SearchPanel({ search }) {
  const {
    searchOpen, searchTerm, setSearchTerm, phoneticMode, setPhoneticMode,
    totalMatches, activeMatch, goNextMatch, goPrevMatch,
    searchInputRef, closeSearch,
  } = search

  if (!searchOpen) return null

  return (
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
              closeSearch()
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
        <button title="Close search" onClick={closeSearch}>
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
  )
}
