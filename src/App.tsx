import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, CircleHelp, Clock3, FileText, GitBranch, Lightbulb, Plus, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { alternativeBranches, assumption, branches, chapterManuscripts, chapters, clues, findings, fundgrubeContradiction, fundgrubeFigures, fundgrubeFindings, fundgrubePlaces, fundgrubeThreads, loadingSteps, manuscript, questions, versionHistory, versionsBranches, type Branch } from './data/mock'
import './notes.css'

type PanelState = 'input' | 'loading' | 'result' | 'empty' | 'boundary' | 'clues'
type Feedback = { message: string; action: string } | null
type Page = 'schreibraum' | 'fundgrube' | 'versionen'
type FundgrubeView = 'Übersicht' | 'Figuren' | 'Orte' | 'Offene Fäden' | 'Widersprüche' | 'Notizen'
type FundgrubeFilter = 'all' | 'new' | 'confirmed'
type ManuscriptSelection = { start: number; end: number; text: string }
type SaveState = 'saving' | 'saved'
type PrivateNote = { id: string; chapter: number; question: string; text: string; selection: ManuscriptSelection }
type ClueStatus = { status: 'saved' | 'skipped'; text: string }
type VersionsMode = 'overview' | 'changes'

const initialSelectionStart = manuscript.paragraphs.slice(0, 2).join('').length
const initialManuscriptSelection = { start: initialSelectionStart, end: initialSelectionStart + manuscript.paragraphs[2].length, text: manuscript.selection }

function selectionParts(text: string, textStart: number, selection: ManuscriptSelection | null) {
  if (!selection || selection.end <= textStart || selection.start >= textStart + text.length) return text
  const start = Math.max(0, selection.start - textStart)
  const end = Math.min(text.length, selection.end - textStart)
  return <>{text.slice(0, start)}<mark className="highlighted">{text.slice(start, end)}</mark>{text.slice(end)}</>
}

function figuresInText(text: string) {
  const figures: string[] = []
  if (/\bKönig\b/.test(text)) figures.push('König Aldric')
  if (/\bPrinz Edrik\b/.test(text)) figures.push('Prinz Edrik')
  if (/\bTeo\b/.test(text)) figures.push('Teo')
  if (/\bMira\b/.test(text)) figures.push('Mira')
  return figures
}

function understoodText(text: string, intent: string | null, scope: string) {
  if (!intent) return ''
  let sentence = 'Du möchtest diese Stelle genauer betrachten.'
  if (intent === 'Ich stecke fest') sentence = /König/.test(text) && /Prinz Edrik/.test(text) ? 'Dir fehlt ein Thronfolger: Der König ist tot, und Prinz Edrik ist schon in Kap. 4 gestorben.' : 'Du suchst Möglichkeiten, weil sich an dieser Stelle eine Frage öffnet.'
  if (intent === 'Was habe ich vergessen?') sentence = 'Du möchtest offene Fäden und Figuren prüfen, die mit dieser Stelle verbunden sind.'
  if (intent === 'Perspektive wechseln') sentence = 'Du möchtest die Szene aus der Sicht der Figuren betrachten, die an dieser Stelle vorkommen.'
  return `${sentence} Ich schaue in: ${scope}.`
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function SourceLine({ sources, onOpenChapter }: { sources: { chapter: number; page: number }[]; onOpenChapter: (chapter: number) => void }) {
  return <p className="source">Quelle: {sources.map((source, i) => <span key={`${source.chapter}-${source.page}`}>{source.chapter >= 15 && source.chapter <= 18 ? <button className="source-link" onClick={() => onOpenChapter(source.chapter)}>Kap. {source.chapter}, S. {source.page}</button> : <>Kap. {source.chapter}, S. {source.page}</>}{i < sources.length - 1 ? ' · ' : ''}</span>)} ↗</p>
}

function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('mousedown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape) }
  }, [])
  return <div className="project-switcher" ref={menuRef}><button className="project-title" onClick={() => setOpen(current => !current)} aria-expanded={open} aria-haspopup="menu"><span>Der Sommer der Könige</span><ChevronDown size={15} /></button>{open && <div className="project-menu" role="menu"><strong>Deine Projekte</strong><button className="active" role="menuitem"><span><b>Der Sommer der Könige</b><small>18 Kapitel · heute bearbeitet</small></span><i>✓</i></button><button role="menuitem"><span><b>Das Lied der Salzwüste</b><small>7 Kapitel · vor 3 Wochen</small></span></button><button role="menuitem"><span><b>Nordlicht über Velmor</b><small>Idee · noch kein Kapitel</small></span></button><hr /><button className="menu-link" role="menuitem">Alle Projekte ansehen</button><button className="menu-link" role="menuitem">+ Neues Projekt</button></div>}</div>
}

function BranchSwitcher({ activeBranch, brotherCreated, onChange }: { activeBranch: 'main' | 'brother'; brotherCreated: boolean; onChange: (branch: 'main' | 'brother') => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('mousedown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape) }
  }, [])
  const choose = (branch: 'main' | 'brother') => { onChange(branch); setOpen(false) }
  return <div className="branch-switcher" ref={menuRef}><button className={`active-branch-pill ${activeBranch}`} onClick={() => setOpen(current => !current)} aria-expanded={open} aria-haspopup="menu">⌘ {activeBranch === 'main' ? 'Hauptlinie' : 'Zweig: Bruder'}⌄</button>{open && <div className="branch-menu" role="menu"><button className={activeBranch === 'main' ? 'active' : ''} onClick={() => choose('main')} role="menuitem">Hauptlinie</button>{brotherCreated && <button className={activeBranch === 'brother' ? 'active' : ''} onClick={() => choose('brother')} role="menuitem">Zweig „Bruder“</button>}</div>}</div>
}

function SaveStatus({ state, branch }: { state: SaveState; branch?: 'brother' }) {
  return <div className={`save-status ${state}`} role="status" aria-live="polite">{state === 'saving' ? <><i aria-hidden="true"></i>Speichert …</> : <><b aria-hidden="true">✓</b>{branch === 'brother' ? 'Gespeichert im Zweig „Bruder“' : 'Gespeichert'}</>}</div>
}

export default function App() {
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [scope, setScope] = useState('Kap. 1–18')
  const [intent, setIntent] = useState<string | null>(null)
  const [editingAssumption, setEditingAssumption] = useState(false)
  const [assumptionText, setAssumptionText] = useState(assumption)
  const [assumptionDraft, setAssumptionDraft] = useState(assumption)
  const [isUnderstandingLoading, setIsUnderstandingLoading] = useState(false)
  const [questionDraft, setQuestionDraft] = useState('')
  const [addedQuestion, setAddedQuestion] = useState<string | null>(null)
  const [privateNotes, setPrivateNotes] = useState<PrivateNote[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [panelSelection, setPanelSelection] = useState<ManuscriptSelection | null>(null)
  const [panelChapter, setPanelChapter] = useState<number | null>(null)
  const [selectionRequired, setSelectionRequired] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [volume, setVolume] = useState('leise')
  const [selectedLens, setSelectedLens] = useState('neutral')
  const [selectedClue, setSelectedClue] = useState<number | null>(null)
  const [branchSaved, setBranchSaved] = useState(false)
  const [clueStates, setClueStates] = useState<Record<number, ClueStatus>>({})
  const [brotherContinuation, setBrotherContinuation] = useState('')
  const [mainContinuation, setMainContinuation] = useState('')
  const [mainTrace, setMainTrace] = useState('')
  const [branchMerged, setBranchMerged] = useState(false)
  const [versionsMode, setVersionsMode] = useState<VersionsMode>('overview')
  const [findingsState, setFindingsState] = useState<Record<string, 'new' | 'confirmed' | 'removed'>>({})
  const [hasFundgrubeUpdates, setHasFundgrubeUpdates] = useState(false)
  const [threadStatus, setThreadStatus] = useState(() => Object.fromEntries(fundgrubeThreads.map(thread => [thread.id, thread.status])) as Record<string, string>)
  const [activeBranch, setActiveBranch] = useState<'main' | 'brother'>('main')
  const [brotherCreated, setBrotherCreated] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [panelWidth, setPanelWidth] = useState(460)
  const [page, setPage] = useState<Page>('schreibraum')
  const [manuscriptSelection, setManuscriptSelection] = useState<ManuscriptSelection | null>(initialManuscriptSelection)
  const manuscriptRef = useRef<HTMLElement>(null)
  const [activeChapter, setActiveChapter] = useState(18)
  const currentManuscript = chapterManuscripts[activeChapter]
  const canContinueInBrother = activeChapter === 18 && activeBranch === 'brother' && branchSaved
  const brotherTrace = clueStates[0]?.status === 'saved' ? clueStates[0].text : ''
  const changedChapters = [brotherTrace && 2, brotherContinuation.trim() && 18].filter(Boolean) as number[]
  const selectedText = manuscriptSelection?.text ?? ''
  const selectedFigures = figuresInText(selectedText)
  const understandingContextRef = useRef('')
  const understandingLoadingContextRef = useRef('')
  const saveTimerRef = useRef<number | null>(null)
  const fundgrubeBadge = hasFundgrubeUpdates ? fundgrubeFindings.filter(finding => findingsState[finding.id] !== 'confirmed' && findingsState[finding.id] !== 'removed').length : 0

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setManuscriptSelection(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (panel !== 'loading') return
    const timeout = window.setTimeout(() => setPanel('result'), 2100)
    return () => window.clearTimeout(timeout)
  }, [panel])

  useEffect(() => () => {
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
  }, [])

  useEffect(() => {
    if (panel === 'result') setHasFundgrubeUpdates(true)
  }, [panel])

  useEffect(() => {
    if (scope.startsWith('Figur:') && !selectedFigures.some(figure => scope === `Figur: ${figure}`)) setScope('Kap. 1–18')
  }, [scope, selectedText])

  useEffect(() => {
    const context = `${selectedText}::${intent ?? ''}::${scope}`
    if (!editingAssumption && understandingContextRef.current !== context) {
      const nextAssumption = understoodText(selectedText, intent, scope)
      setAssumptionText(nextAssumption)
      setAssumptionDraft(nextAssumption)
      understandingContextRef.current = context
    }
  }, [selectedText, intent, scope, editingAssumption])

  useEffect(() => {
    const context = `${intent ?? ''}::${scope}`
    if (!intent || understandingLoadingContextRef.current === context) return
    understandingLoadingContextRef.current = context
    setIsUnderstandingLoading(true)
    const timeout = window.setTimeout(() => setIsUnderstandingLoading(false), 1000)
    return () => window.clearTimeout(timeout)
  }, [intent, scope])

  const openPanel = () => { setPanel(current => current ?? 'input'); setFeedback(null); setSelectionRequired(!manuscriptSelection) }
  const resetPanel = () => {
    setPanel('input')
    setFeedback(null)
    setIntent(null)
    setScope('Kap. 1–18')
    setEditingAssumption(false)
    setAssumptionText('')
    setAssumptionDraft('')
    setQuestionDraft('')
    setAddedQuestion(null)
    setIsUnderstandingLoading(false)
    understandingContextRef.current = ''
    understandingLoadingContextRef.current = ''
    setShowAlternatives(false)
    setSelectedLens('neutral')
  }
  const act = (message: string, action: string) => setFeedback({ message, action })
  const markImportantChange = () => {
    setSaveState('saving')
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => setSaveState('saved'), 900)
  }
  const changeBranch = (branch: 'main' | 'brother') => {
    if (branch === activeBranch) return
    setActiveBranch(branch)
    markImportantChange()
  }
  const closePanel = () => {
    if (panel === 'clues') setActiveBranch('main')
    setPanel(null)
  }
  const navigateFromWritingRoom = (destination: Exclude<Page, 'schreibraum'>) => {
    if (panel === 'clues') {
      setActiveBranch('main')
    }
    setPage(destination)
  }
  const returnToWritingRoom = () => {
    if (panel === 'clues') setActiveBranch('brother')
    setPage('schreibraum')
  }
  const updatePanelWidth = (nextWidth: number) => {
    const maxWidth = Math.min(680, Math.max(380, window.innerWidth - 620))
    setPanelWidth(Math.min(Math.max(380, nextWidth), maxWidth))
  }
  const startPanelResize = (startX: number) => {
    const startWidth = panelWidth
    const onMove = (event: PointerEvent) => updatePanelWidth(startWidth + startX - event.clientX)
    const stop = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
  }
  const undo = () => {
    if (feedback) {
      setFeedback(null)
      setBranchSaved(false)
      return
    }
    if (panel === 'result') setPanel('input')
  }
  const exploreBranch = (branch: Branch) => {
    if (branch.id === 'brother') { setBrotherCreated(true); setActiveBranch('brother'); markImportantChange(); setPanel('clues'); setFeedback({ action: 'Zweig „Bruder“', message: 'Neuer Zweig „Bruder“ angelegt · Original bleibt' }) }
    else act(`„${branch.title}“ bleibt als Möglichkeit sichtbar.`, 'Gemerkte Möglichkeit')
  }
  const openSourceChapter = (chapter: number) => {
    setActiveChapter(chapter)
    setManuscriptSelection(chapter === 18 ? initialManuscriptSelection : null)
    setPanel(null)
    setPage('schreibraum')
  }
  const captureSelection = () => {
    const root = manuscriptRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed || !selection.anchorNode || !selection.focusNode || !root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) return
    const range = selection.getRangeAt(0)
    const paragraphs = Array.from(root.querySelectorAll<HTMLElement>('[data-manuscript-paragraph]'))
    const textPosition = (node: Node, offset: number) => {
      if (!paragraphs.length) return null
      const fromFirstParagraph = document.createRange()
      fromFirstParagraph.setStartBefore(paragraphs[0])
      try {
        fromFirstParagraph.setEnd(node, offset)
        return fromFirstParagraph.toString().length
      } catch {
        return null
      }
    }
    const start = textPosition(range.startContainer, range.startOffset)
    const end = textPosition(range.endContainer, range.endOffset)
    const text = range.toString().trim()
    if (!text || start === null || end === null) return
    setManuscriptSelection({ start, end, text })
    setSelectionRequired(false)
    window.setTimeout(() => selection.removeAllRanges(), 0)
  }
  const savePrivateNote = (question: string, text: string) => {
    const noteSelection = panelSelection ?? manuscriptSelection
    if (!noteSelection || !text.trim()) return false
    const note: PrivateNote = { id: `${Date.now()}`, chapter: panelChapter ?? activeChapter, question, text: text.trim(), selection: noteSelection }
    setPrivateNotes(current => [...current, note])
    markImportantChange()
    setFeedback({ action: 'Notiz gemerkt', message: 'Notiz gemerkt · dein Manuskript bleibt unverändert.' })
    return true
  }
  const updatePrivateNote = (id: string, text: string) => {
    setPrivateNotes(current => current.map(note => note.id === id ? { ...note, text } : note))
    setEditingNoteId(null)
    markImportantChange()
  }
  const deletePrivateNote = (id: string) => {
    setPrivateNotes(current => current.filter(note => note.id !== id))
    setEditingNoteId(null)
    markImportantChange()
  }
  const openPrivateNote = (note: PrivateNote) => {
    setActiveChapter(note.chapter)
    setManuscriptSelection(note.selection)
    setPage('schreibraum')
  }
  const mergeBrotherIntoMain = () => {
    setMainContinuation(brotherContinuation)
    setMainTrace(brotherTrace)
    setBranchMerged(true)
    setVersionsMode('overview')
    setActiveBranch('main')
    markImportantChange()
  }
  const discardBrother = () => {
    setActiveBranch('main')
    setBrotherCreated(false)
    setBranchSaved(false)
    setClueStates({})
    setBrotherContinuation('')
    setBranchMerged(false)
    markImportantChange()
  }
  const openBranchChanges = () => {
    setVersionsMode('changes')
    setPage('versionen')
  }
  const openBranchChapter = (chapter: number) => {
    setActiveBranch('brother')
    setActiveChapter(chapter)
    setManuscriptSelection(null)
    setVersionsMode('overview')
    setPage('schreibraum')
  }
  const continueInBranch = () => openBranchChapter(18)

  if (page === 'fundgrube') {
    return <Fundgrube volume={volume} setVolume={setVolume} notificationCount={fundgrubeBadge} findingsState={findingsState} setFindingsState={setFindingsState} threadStatus={threadStatus} setThreadStatus={setThreadStatus} notes={privateNotes} activeBranch={activeBranch} brotherCreated={brotherCreated} setActiveBranch={changeBranch} onSave={markImportantChange} onOpenNote={openPrivateNote} onWritingRoom={returnToWritingRoom} onVersions={() => setPage('versionen')} />
  }
  if (page === 'versionen') {
    return <Versions volume={volume} setVolume={setVolume} notificationCount={fundgrubeBadge} activeBranch={activeBranch} brotherCreated={brotherCreated} clueStates={clueStates} brotherContinuation={brotherContinuation} view={versionsMode} setActiveBranch={changeBranch} onMerge={mergeBrotherIntoMain} onDiscard={discardBrother} onContinue={continueInBranch} onOpenChapter={openBranchChapter} onSave={markImportantChange} onWritingRoom={returnToWritingRoom} onFundgrube={() => setPage('fundgrube')} />
  }

  return (
    <main className={`app ${panel ? 'panel-open' : ''}`} style={{ '--panel-width': `${panelWidth}px` } as CSSProperties}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
        <ProjectSwitcher /><BranchSwitcher activeBranch={activeBranch} brotherCreated={brotherCreated} onChange={changeBranch} />
        <nav aria-label="Projektbereiche"><button className="nav-link current">Schreibraum</button><button className="nav-link" onClick={() => navigateFromWritingRoom('fundgrube')}>Fundgrube {fundgrubeBadge > 0 && <span className="new-dot">{fundgrubeBadge}</span>}</button><button className="nav-link" onClick={() => navigateFromWritingRoom('versionen')}>Versionen & Zweige</button></nav>
        <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={e => setVolume(e.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
      </header>

      {activeBranch === 'brother' && <div className="branch-bar"><div><GitBranch size={15} /><strong>Du schreibst im Zweig „Bruder“</strong><span>·</span><span>{changedChapters.length} {changedChapters.length === 1 ? 'Änderung' : 'Änderungen'} · {changedChapters.map(chapter => `Kap. ${chapter}`).join(', ') || 'noch keine Kapitel'}</span><button onClick={openBranchChanges}>Alle Änderungen ansehen</button></div><button onClick={() => changeBranch('main')}>Zur Hauptlinie</button></div>}
      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title"><span>MANUSKRIPT</span><button aria-label="Kapitel hinzufügen"><Plus size={17} /></button></div>
          <div className="book-title"><FileText size={16} /> Der Sommer der Könige</div>
          <div className="chapter-list">{chapters.map(chapter => <button key={chapter.number} onClick={() => { setActiveChapter(chapter.number); setManuscriptSelection(chapter.number === 18 ? initialManuscriptSelection : null); closePanel() }} className={`chapter ${activeChapter === chapter.number ? 'selected' : ''}`}><span>Kap. {chapter.number}</span><span>{chapter.title}</span><small>{activeBranch === 'brother' && changedChapters.includes(chapter.number) && <i className="chapter-change-dot" />}S. {chapter.page}</small></button>)}</div>
          <div className="sidebar-bottom"><button><Search size={16} />Durchsuchen</button><button><CircleHelp size={16} />Hilfe & Feedback</button></div>
        </aside>

        <section className="editor" aria-label="Manuskript" onClick={event => { if (event.target === event.currentTarget) setManuscriptSelection(null) }}>
          <div className="editor-utility-row"><div className="editor-selection-hint" role="note"><span>Tipp</span> Text markieren: Mit der Maus über eine Stelle ziehen.</div><SaveStatus state={saveState} branch={activeBranch === 'brother' ? 'brother' : undefined} /></div>
          <div className="editor-meta"><span>Kapitel {activeChapter}</span><span>·</span><span>Seite {currentManuscript.page}</span></div>
          <article className="manuscript" ref={manuscriptRef} onMouseUp={captureSelection} onClick={event => { if (event.target === event.currentTarget) setManuscriptSelection(null) }}>
            <h1>{currentManuscript.title}</h1>
            {(() => { let offset = 0; return currentManuscript.paragraphs.map(paragraph => { const start = offset; offset += paragraph.length; const actionAfter = manuscriptSelection && manuscriptSelection.end > start && manuscriptSelection.end <= offset; const paragraphNotes = privateNotes.filter(note => note.chapter === activeChapter && note.selection.end > start && note.selection.end <= offset); const traceText = activeBranch === 'brother' ? brotherTrace : mainTrace; const showBranchTrace = activeChapter === 2 && paragraph.includes('Stallmeister') && traceText && (activeBranch === 'brother' || branchMerged); const insertContinuation = canContinueInBrother && actionAfter; const insertMergedContinuation = activeChapter === 18 && activeBranch === 'main' && Boolean(mainContinuation) && actionAfter; return <div className="manuscript-entry" key={paragraph}><p data-manuscript-paragraph>{selectionParts(paragraph, start, manuscriptSelection)}{showBranchTrace && <span className={activeBranch === 'brother' ? 'inline-branch-trace' : 'inline-merged-trace'}> {traceText}</span>}</p>{paragraphNotes.map(note => <MarginNote key={note.id} note={note} editing={editingNoteId === note.id} onEdit={() => setEditingNoteId(note.id)} onCancel={() => setEditingNoteId(null)} onUpdate={updatePrivateNote} onDelete={deletePrivateNote} />)}{insertContinuation && <><BranchContinuation value={brotherContinuation} onChange={value => { setBrotherContinuation(value); markImportantChange() }} /><div className="branch-note"><span className="check">✓</span> Gespeichert im Zweig <strong>„Bruder“</strong> · Original bleibt<button className="branch-return" onClick={mergeBrotherIntoMain}>Speichern &amp; zur Hauptlinie</button></div></>}{insertMergedContinuation && <p className="merged-manuscript-continuation">{mainContinuation}</p>}{actionAfter && <div className="selection-actions"><span>Markierte Stelle</span><button onClick={openPanel}><Sparkles size={15} />Innehalten zu dieser Stelle</button></div>}</div> }) })()}
            {activeChapter === 18 && activeBranch === 'brother' && <p className="branch-text-legend">Neu im Zweig „Bruder“ · grün unterstrichen = von dir geschrieben</p>}
            {activeChapter === 18 && activeBranch === 'main' && brotherCreated && !branchMerged && <aside className="mainline-branch-hint">Du bist in der Hauptlinie: das Original, ohne die Änderungen aus dem Zweig „Bruder“. Der Zweig bleibt gespeichert.</aside>}
          </article>
          <button className="pause-button" onClick={openPanel}><span className="pause-icon">Ⅱ</span> Innehalten</button>
        </section>

        {panel && <aside className="ai-panel" aria-label="Innehalten-Panel"><button className="panel-resizer" aria-label="Breite des Innehalten-Panels anpassen" onPointerDown={event => { event.preventDefault(); startPanelResize(event.clientX) }} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); updatePanelWidth(panelWidth + (event.key === 'ArrowLeft' ? 24 : -24)) } }} />
          <div className="panel-header"><div><div className="eyebrow ai-label"><Sparkles size={13} /> KI-IMPULS</div><h2>{panel === 'clues' ? 'Spuren legen' : 'Innehalten'}</h2></div><button className="icon-button" onClick={closePanel} aria-label="Panel schließen"><X size={20} /></button></div>
          {panel !== 'input' && panel !== 'clues' && <div className="panel-context">Bezieht sich auf <strong>{scope}</strong></div>}
          {panel === 'input' && <InputPanel selectionText={selectedText} selectionRequired={selectionRequired} figureNames={selectedFigures} scope={scope} setScope={setScope} intent={intent} setIntent={setIntent} editing={editingAssumption} setEditing={setEditingAssumption} assumptionText={assumptionText} setAssumptionText={setAssumptionText} draft={assumptionDraft} setDraft={setAssumptionDraft} isUnderstandingLoading={isUnderstandingLoading} questionDraft={questionDraft} setQuestionDraft={setQuestionDraft} addedQuestion={addedQuestion} setAddedQuestion={setAddedQuestion} onSave={markImportantChange} onStart={() => { if (!manuscriptSelection) { setSelectionRequired(true); return }; setPanelSelection(manuscriptSelection); setPanelChapter(activeChapter); setPanel('loading') }} />}
          {panel === 'loading' && <LoadingPanel onCancel={() => setPanel('input')} />}
          {panel === 'result' && <ResultPanel lens={selectedLens} setLens={setSelectedLens} branches={showAlternatives ? alternativeBranches : branches} notes={privateNotes} chapter={activeChapter} onSaveNote={savePrivateNote} onExplore={exploreBranch} onAction={act} onAlternatives={() => setShowAlternatives(true)} onFundgrube={() => setPage('fundgrube')} onOpenChapter={openSourceChapter} />}
          {panel === 'empty' && <EmptyPanel onClose={() => setPanel(null)} onExpand={() => { setScope('Ganzes Manuskript'); setPanel('loading') }} />}
          {panel === 'boundary' && <BoundaryPanel onQuestions={() => { setIntent('Was habe ich vergessen?'); setPanel('loading') }} onPerspective={() => { setIntent('Perspektive wechseln'); setPanel('input') }} />}
          {panel === 'clues' && <CluesPanel selected={selectedClue} setSelected={setSelectedClue} clueStates={clueStates} setClueStates={setClueStates} onChange={markImportantChange} onSave={() => { setBranchSaved(true); setActiveBranch('brother'); markImportantChange(); setFeedback({ message: 'Zweig „Bruder“ gesichert · Original bleibt', action: 'Zweig „Bruder“' }); setPanel(null) }} />}
          {panel !== 'clues' && <div className="panel-footer"><button onClick={undo} disabled={!feedback && panel !== 'result'}><RotateCcw size={15} />Rückgängig</button><button onClick={resetPanel}>Panel zurücksetzen</button><button onClick={() => setPanel(null)}>Panel schließen</button></div>}
          {feedback && <div className="toast"><span>✓</span><div><strong>{feedback.action}</strong><p>{feedback.message}</p></div><button onClick={undo} aria-label="Rückmeldung schließen"><X size={15} /></button></div>}
        </aside>}
      </div>
    </main>
  )
}

function Versions({ volume, setVolume, notificationCount, activeBranch, brotherCreated, clueStates, brotherContinuation, view, setActiveBranch, onMerge, onDiscard, onContinue, onOpenChapter, onSave, onWritingRoom, onFundgrube }: { volume: string; setVolume: (value: string) => void; notificationCount: number; activeBranch: 'main' | 'brother'; brotherCreated: boolean; clueStates: Record<number, ClueStatus>; brotherContinuation: string; view: VersionsMode; setActiveBranch: (branch: 'main' | 'brother') => void; onMerge: () => void; onDiscard: () => void; onContinue: () => void; onOpenChapter: (chapter: number) => void; onSave: () => void; onWritingRoom: () => void; onFundgrube: () => void }) {
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const active = versionsBranches.find(branch => branch.id === activeBranch) ?? versionsBranches[0]
  const savedClueIndex = clues.findIndex((_, index) => clueStates[index]?.status === 'saved')
  const savedClue = savedClueIndex >= 0 ? clues[savedClueIndex] : null
  const savedClueText = savedClueIndex >= 0 ? clueStates[savedClueIndex].text : ''
  const branchHistory = brotherContinuation.trim() ? [{ title: 'Kap. 18 · Weitergeschrieben', detail: 'Heute · von dir geschrieben', branch: 'Zweig „Bruder“', tone: 'author' }, ...versionHistory] : versionHistory
  const continuationOriginal = chapterManuscripts[18].paragraphs.at(-1) ?? ''
  const comparisonTitle = brotherContinuation.trim() ? 'Kap. 18 „Die leere Krone“' : savedClue ? `Kap. ${savedClue.chapter}` : 'Kap. 2 „Zwei Brüder im Schnee“'
  const comparisonOriginal = brotherContinuation.trim() ? continuationOriginal : savedClue ? savedClue.context : 'Der König sprach selten von seiner Kindheit. Wenn er es doch tat, dann nur vom Winter im Nordhof und vom Schnee, der alle Spuren verwischte.'
  const branchChanges = [savedClueText && { chapter: savedClue?.chapter ?? 2, original: savedClue?.excerpt ?? '', text: savedClueText, meta: '+ 1 Satz · Spur · von dir geschrieben' }, brotherContinuation.trim() && { chapter: 18, original: continuationOriginal, text: brotherContinuation, meta: '+ 1 Absatz · weitergeschrieben · von dir geschrieben' }].filter(Boolean) as { chapter: number; original: string; text: string; meta: string }[]
  const notify = (message: string) => { onSave(); setNotice(message); window.setTimeout(() => setNotice(null), 2600) }
  return <main className="app versions-app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
      <ProjectSwitcher /><BranchSwitcher activeBranch={activeBranch} brotherCreated={brotherCreated} onChange={setActiveBranch} />
      <nav aria-label="Projektbereiche"><button className="nav-link" onClick={onWritingRoom}>Schreibraum</button><button className="nav-link" onClick={onFundgrube}>Fundgrube {notificationCount > 0 && <span className="new-dot">{notificationCount}</span>}</button><button className="nav-link current">Versionen & Zweige</button></nav>
      <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={event => setVolume(event.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
    </header>
    <div className="versions-layout">
      <aside className="versions-sidebar"><div className="side-title"><span>ZWEIGE</span></div>{versionsBranches.map(branch => <button key={branch.id} className={activeBranch === branch.id ? 'active' : ''} onClick={() => { if (branch.id === 'main' || (branch.id === 'brother' && brotherCreated)) setActiveBranch(branch.id) }}><i className={branch.id === 'brother' ? 'green' : ''} /><span><strong>{branch.name}</strong><small>{branch.detail}</small></span></button>)}<div className="versions-note">Nichts geht verloren. Jede Änderung wird automatisch gesichert, das Original bleibt immer erhalten.</div></aside>
      <section className="versions-content"><div className="versions-heading"><div className="eyebrow author-label">NICHTS GEHT VERLOREN</div><h1>{view === 'changes' ? 'Zweig „Bruder“ · alle Änderungen' : 'Versionen & Zweige'}</h1><p>{view === 'changes' ? 'Entstanden aus Innehalten · Kap. 18 · „Ein Bruder existiert“. Links das Original, rechts deine Änderungen.' : <>Probier Ideen aus, ohne etwas zu riskieren. {activeBranch === 'brother' ? 'Der Zweig „Bruder“ ist gerade aktiv.' : 'Die Hauptlinie ist gerade aktiv.'}</>}</p></div>
        {view === 'changes' ? <BranchChanges changes={branchChanges} onOpenChapter={onOpenChapter} onMerge={() => { onMerge(); notify('In die Hauptlinie übernommen') }} onContinue={onContinue} onDiscard={() => { onDiscard(); notify('Zweig verworfen · Original bleibt') }} /> : <>
        <section className="comparison-card"><div className="comparison-title"><strong>Zweig-Vergleich · {comparisonTitle}</strong><span><Sparkles size={11} /> Unterschiede markiert</span></div><div className="compare-texts"><article><label>ORIGINAL · HAUPTLINIE</label><p>{comparisonOriginal}</p></article><article className="branch-version"><label>ZWEIG „BRUDER“</label>{brotherContinuation.trim() ? <><p>{comparisonOriginal} <mark className="author-insert">{brotherContinuation}</mark></p><small>+1 Satz · von dir geschrieben</small></> : savedClue ? <><p>{savedClue.context} <mark className="author-insert">{savedClueText}</mark></p><small>+1 Satz · von dir geschrieben</small></> : <><p>Der König sprach selten von seiner Kindheit. Wenn er es doch tat, dann nur vom Winter im Nordhof und vom Schnee, der alle Spuren verwischte. <mark>„Wir waren zwei“, sagte er einmal, und schwieg danach so lange, dass niemand nachzufragen wagte.</mark></p><small>+1 Satz · von dir geschrieben</small></>}</article></div><div className="compare-actions"><button className="author-primary" onClick={() => { onMerge(); notify('In die Hauptlinie übernommen') }}>Zweig übernehmen</button><button>Im Zweig weiterschreiben</button><button onClick={() => setConfirmDiscard(true)}>Zweig verwerfen</button></div>{confirmDiscard && <div className="discard-confirm"><span>Wirklich verwerfen? Das Original bleibt erhalten.</span><button onClick={() => { setConfirmDiscard(false); notify('Zweig verworfen') }}>Verwerfen</button><button onClick={() => setConfirmDiscard(false)}>Abbrechen</button></div>}</section>
        <div className="versions-columns"><section className="history"><div className="history-title"><h2>Verlauf</h2><span>automatisch gesichert</span></div><div className="history-card">{branchHistory.map(item => <article key={item.title}><i className={item.tone} /><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className={item.tone === 'author' || item.tone === 'branch' ? 'branch-badge' : 'main-badge'}>{item.branch}</span><button onClick={() => notify('Version wiederhergestellt')}>Wiederherstellen</button></article>)}</div></section><aside><section className="branch-summary"><h2>{active.name}</h2><p>Entstanden aus:</p><strong>Innehalten · Kap. 18 · „Ein Bruder existiert“</strong><p>Spuren gelegt: 2 von 5 Stellen</p><div className="branch-progress"><i /></div><button>Weitere Spuren legen ↗</button></section><section className="saved-info"><h2>Was gesichert wird</h2><ul><li>jede Änderung, automatisch</li><li>das Original bleibt immer erhalten</li><li>Zweige übernimmt nur du</li></ul><small>KI · automatisieren: sichert und markiert. Entscheiden: nur du.</small></section></aside></div></>}
      </section>
    </div>{notice && <div className="versions-toast">✓ {notice}</div>}
  </main>
}

function BranchChanges({ changes, onOpenChapter, onMerge, onContinue, onDiscard }: { changes: { chapter: number; original: string; text: string; meta: string }[]; onOpenChapter: (chapter: number) => void; onMerge: () => void; onContinue: () => void; onDiscard: () => void }) {
  return <div className="branch-changes-view">{changes.map(change => <section className="change-card" key={change.chapter}><div className="change-card-top"><strong>Kap. {change.chapter}</strong><button onClick={() => onOpenChapter(change.chapter)}>Zur Stelle ↗</button></div><div className="compare-texts"><article><label>ORIGINAL · HAUPTLINIE</label><p>{change.original}</p></article><article className="branch-version"><label>ZWEIG „BRUDER“</label><p>{change.original} <mark className="author-insert">{change.text}</mark></p><small>{change.meta}</small></article></div></section>)}{changes.length === 0 && <div className="changes-empty">Noch keine gespeicherten Änderungen im Zweig.</div>}<div className="compare-actions branch-changes-actions"><button className="author-primary" onClick={onMerge}>Zweig übernehmen</button><button onClick={onContinue}>Im Zweig weiterschreiben</button><button onClick={onDiscard}>Zweig verwerfen</button></div></div>
}

function Fundgrube({ volume, setVolume, notificationCount, findingsState, setFindingsState, threadStatus, setThreadStatus, notes, activeBranch, brotherCreated, setActiveBranch, onSave, onOpenNote, onWritingRoom, onVersions }: { volume: string; setVolume: (value: string) => void; notificationCount: number; findingsState: Record<string, 'new' | 'confirmed' | 'removed'>; setFindingsState: React.Dispatch<React.SetStateAction<Record<string, 'new' | 'confirmed' | 'removed'>>>; threadStatus: Record<string, string>; setThreadStatus: React.Dispatch<React.SetStateAction<Record<string, string>>>; notes: PrivateNote[]; activeBranch: 'main' | 'brother'; brotherCreated: boolean; setActiveBranch: (branch: 'main' | 'brother') => void; onSave: () => void; onOpenNote: (note: PrivateNote) => void; onWritingRoom: () => void; onVersions: () => void }) {
  const [view, setView] = useState<FundgrubeView>('Übersicht')
  const [filter, setFilter] = useState<FundgrubeFilter>('all')
  const [contradictionVisible, setContradictionVisible] = useState(true)
  const visibleFindings = fundgrubeFindings.filter(finding => findingsState[finding.id] !== 'removed')
  const newCount = fundgrubeFindings.filter(finding => !findingsState[finding.id] || findingsState[finding.id] === 'new').length
  const filteredFindings = visibleFindings.filter(finding => filter === 'all' || (filter === 'new' ? !findingsState[finding.id] || findingsState[finding.id] === 'new' : findingsState[finding.id] === 'confirmed'))
  const cycleStatus = (id: string) => { setThreadStatus(current => ({ ...current, [id]: current[id] === 'offen' ? 'bewusst offen' : current[id] === 'bewusst offen' ? 'loslassen' : 'offen' })); onSave() }
  const show = (name: FundgrubeView) => view === 'Übersicht' || view === name

  return <main className="app fundgrube-app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
      <ProjectSwitcher /><BranchSwitcher activeBranch={activeBranch} brotherCreated={brotherCreated} onChange={setActiveBranch} />
      <nav aria-label="Projektbereiche"><button className="nav-link" onClick={onWritingRoom}>Schreibraum</button><button className="nav-link current">Fundgrube {notificationCount > 0 && <span className="new-dot">{newCount}</span>}</button><button className="nav-link" onClick={onVersions}>Versionen & Zweige</button></nav>
      <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={event => setVolume(event.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
    </header>
    <div className="fundgrube-layout">
      <aside className="fundgrube-sidebar"><div className="side-title"><span>FUNDGRUBE</span></div>{(['Übersicht', 'Figuren', 'Orte', 'Offene Fäden', 'Widersprüche', 'Notizen'] as FundgrubeView[]).map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}<span>{item === 'Figuren' ? 6 : item === 'Orte' ? 4 : item === 'Offene Fäden' ? 5 : item === 'Widersprüche' ? 1 : item === 'Notizen' ? notes.length : ''}</span></button>)}<div className="gathered-note">Still gesammelt aus Kap. 1–18.<br />Nichts ändert deinen Text.</div></aside>
      <section className="fundgrube-content">
        <div className="fundgrube-heading"><div><div className="eyebrow ai-label"><Sparkles size={13} /> STILL GESAMMELT</div><h1>{view}</h1><p>{view === 'Übersicht' ? <>Was deine Geschichte bisher enthält · bezieht sich auf <strong>Kap. 1–18</strong></> : 'Was deine Geschichte bisher enthält'}</p></div>{view === 'Übersicht' && <div className="fund-filter"><Chip active={filter === 'all'} onClick={() => setFilter('all')}>Alle</Chip><Chip active={filter === 'new'} onClick={() => setFilter('new')}>Neu · {newCount}</Chip><Chip active={filter === 'confirmed'} onClick={() => setFilter('confirmed')}>Bestätigt</Chip></div>}</div>
        {view === 'Übersicht' && <section className="new-findings"><div className="new-findings-title"><strong>{filter === 'confirmed' ? 'Bestätigte Fundstücke' : `${filter === 'new' ? newCount : filteredFindings.length} ${filter === 'new' ? 'neue Fundstücke' : 'Fundstücke'}`}</strong><span>Du entscheidest, was bleibt.</span></div><div className="new-finding-grid">{filteredFindings.map(finding => <article className="new-finding" key={finding.id}><div className="finding-top"><span>{finding.type}</span>{findingsState[finding.id] === 'confirmed' ? <em>bestätigt</em> : <em><Sparkles size={11} /> von KI gefunden</em>}</div><h3>{finding.title}</h3><button className="fund-source">Quelle: {finding.source}</button><div><button className="confirm" onClick={() => { setFindingsState(current => ({ ...current, [finding.id]: 'confirmed' })); onSave() }}>Bestätigen</button><button>Bearbeiten</button><button onClick={() => { setFindingsState(current => ({ ...current, [finding.id]: 'removed' })); onSave() }}>Entfernen</button></div></article>)}</div></section>}
        {view === 'Notizen' && <NotesView notes={notes} onOpenNote={onOpenNote} />}
        {filter === 'all' && <div className="fundgrube-columns">
          <div>
            {show('Figuren') && <FundgrubeFigures />}
            {show('Orte') && <FundgrubePlaces />}
          </div>
          <div>
            {show('Offene Fäden') && <FundgrubeThreads statuses={threadStatus} onCycle={cycleStatus} />}
            {show('Widersprüche') && contradictionVisible && <FundgrubeContradiction onDismiss={() => setContradictionVisible(false)} />}
          </div>
        </div>}
      </section>
    </div>
  </main>
}

function FundgrubeFigures() { return <section className="fund-section"><div className="fund-section-title"><h2>Figuren</h2><button>Alle 6 ansehen</button></div><div className="figure-grid">{fundgrubeFigures.map(figure => <article className="figure-card" key={figure.name}><div><h3>{figure.name}</h3><span>bestätigt</span></div><p>{figure.role}</p><small>Erwähnt: {figure.mentioned}</small><div className="figure-tags">{figure.tags.map(tag => <i key={tag}>{tag}</i>)}</div></article>)}</div></section> }

function FundgrubePlaces() { return <section className="fund-section"><div className="fund-section-title"><h2>Orte</h2><button>Alle 4 ansehen</button></div><div className="places-card">{fundgrubePlaces.map(place => <div key={place.name}><span><strong>{place.name}</strong><small>{place.type}</small></span><small>{place.chapters}</small></div>)}</div></section> }

function FundgrubeThreads({ statuses, onCycle }: { statuses: Record<string, string>; onCycle: (id: string) => void }) { return <section className="threads-card"><h2>Offene Fäden</h2><p>Den Status setzt nur du.</p>{fundgrubeThreads.map(thread => <article key={thread.id}><div><h3>{thread.title}</h3><button className="fund-source">{thread.source}</button></div><button className={`thread-status ${statuses[thread.id].replace(' ', '-')}`} onClick={() => onCycle(thread.id)}>{statuses[thread.id]}⌄</button></article>)}</section> }

function FundgrubeContradiction({ onDismiss }: { onDismiss: () => void }) { return <section className="contradiction-card"><div className="contradiction-title"><h2>Möglicher Widerspruch</h2><span><Sparkles size={11} /> KI-Hinweis</span></div><h3>{fundgrubeContradiction.title}</h3><p>Vielleicht Absicht. Du entscheidest.</p><button className="confirm">Zu den Stellen</button><button onClick={onDismiss}>Ist Absicht</button></section> }

function NotesView({ notes, onOpenNote }: { notes: PrivateNote[]; onOpenNote: (note: PrivateNote) => void }) {
  return <section className="notes-view"><p className="notes-intro">Deine Gedanken bleiben privat und verändern dein Manuskript nicht.</p>{notes.length ? <div className="notes-list">{notes.map(note => <article key={note.id}><small>Kap. {note.chapter}</small><h2>{note.question}</h2><p>{note.text}</p><button onClick={() => onOpenNote(note)}>Zur Stelle <ArrowLeft className="arrow-right" size={13} /></button></article>)}</div> : <div className="notes-empty">Noch keine Notizen. Antworte im Innehalten-Panel auf eine Frage an dich.</div>}</section>
}

function InputPanel(props: { selectionText: string; selectionRequired: boolean; figureNames: string[]; scope: string; setScope: (value: string) => void; intent: string | null; setIntent: (value: string | null) => void; editing: boolean; setEditing: (value: boolean) => void; assumptionText: string; setAssumptionText: (value: string) => void; draft: string; setDraft: (value: string) => void; isUnderstandingLoading: boolean; questionDraft: string; setQuestionDraft: (value: string) => void; addedQuestion: string | null; setAddedQuestion: (value: string | null) => void; onSave: () => void; onStart: () => void }) {
  const intentHelp: Record<string, string> = {
    'Ich stecke fest': 'Ich zeige dir Möglichkeiten, wie es weitergehen könnte.',
    'Was habe ich vergessen?': 'Ich suche offene Fäden und vergessene Figuren.',
    'Perspektive wechseln': 'Ich zeige dir die Szene aus der Sicht einer Figur.',
  }
  const scopes = ['Kap. 1–18', 'nur dieses Kapitel', ...props.figureNames.map(name => `Figur: ${name}`)]
  const addQuestion = () => {
    const question = props.questionDraft.trim()
    if (!question) return
    props.setAddedQuestion(question)
    props.setQuestionDraft('')
    props.onSave()
  }
  return <div className="panel-content input-panel">
    <section className={`selected-text ${props.selectionRequired && !props.selectionText ? 'selection-required' : ''}`}><div className="input-section-heading"><i>1</i><h3>Deine Stelle</h3></div><p>{props.selectionText ? `„${props.selectionText}“` : props.selectionRequired ? 'Markiere zuerst eine Stelle im Manuskript, dann kann ich dir helfen.' : 'Markiere eine Stelle im Text.'}</p></section>
    <section><div className="input-section-heading"><i>2</i><h3>Was brauchst du?</h3></div><div className="chips">{['Ich stecke fest', 'Was habe ich vergessen?', 'Perspektive wechseln'].map(value => <Chip key={value} active={props.intent === value} onClick={() => { if (value !== props.intent) props.setIntent(value) }}>{value}</Chip>)}</div><p className="input-hint">{props.intent ? intentHelp[props.intent] : 'Wähle zuerst, wobei ich dir helfen soll.'}</p></section>
    <section><div className="input-section-heading"><i>3</i><h3>Wo soll ich suchen?</h3></div><div className="chips">{scopes.map(value => <Chip key={value} active={props.scope === value} onClick={() => { if (value !== props.scope) props.setScope(value) }}>{value}</Chip>)}</div><p className="input-hint">Figuren-Chips kommen aus deiner markierten Stelle.</p></section>
    {props.intent && <section><div className="input-section-heading"><i>4</i><h3>So verstehe ich dich</h3></div>{props.isUnderstandingLoading ? <div className="understanding-loading" aria-live="polite"><div className="understanding-loading-label"><Sparkles size={14} /><span className="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Ich lese deine Stelle …</span></div><div className="understanding-skeleton"><i></i><i></i></div></div> : <div className="assumption understanding-ready"><div className="assumption-title"><span>KI</span>{!props.editing && <button onClick={() => { props.setDraft(props.assumptionText); props.setEditing(true) }}>Korrigieren</button>}</div>{props.editing ? <><textarea aria-label="KI-Verständnis korrigieren" value={props.draft} onChange={event => props.setDraft(event.target.value)} /><div className="assumption-actions"><button onClick={() => { props.setAssumptionText(props.draft); props.setEditing(false); props.onSave() }}>Bestätigen</button><button onClick={() => { props.setDraft(props.assumptionText); props.setEditing(false) }}>Abbrechen</button></div></> : <p>{props.assumptionText}</p>}<label className="optional-question">Eigene Frage <span>(optional)</span><div className="question-entry"><input value={props.questionDraft} placeholder="Was möchtest du noch wissen?" onChange={event => props.setQuestionDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addQuestion() } }} /><button type="button" disabled={!props.questionDraft.trim()} onClick={addQuestion}>Hinzufügen</button></div></label>{props.addedQuestion && <div className="added-question"><span>Eigene Frage ergänzt</span><p>„{props.addedQuestion}“</p><button onClick={() => props.setAddedQuestion(null)} aria-label="Eigene Frage entfernen"><X size={13} /></button></div>}</div>}</section>}
    <button className="primary-button" disabled={!props.intent || !props.selectionText || props.isUnderstandingLoading} onClick={props.onStart}><Sparkles size={17} />Innehalten</button>
  </div>
}

function LoadingPanel({ onCancel }: { onCancel: () => void }) { return <div className="panel-content loading"><div className="loading-orbit"><span></span><Sparkles size={23} /></div><h3>Ich sehe mir deine Spuren an</h3><p>Ich prüfe nur den gewählten Bereich und ändere nichts an deinem Text.</p><ul>{loadingSteps.map((step, index) => <li key={step} className={index < 2 ? 'done' : 'working'}><span>{index < 2 ? '✓' : '…'}</span>{step}</li>)}</ul><button className="secondary-button" onClick={onCancel}>Abbrechen</button></div> }

function ResultPanel({ lens, setLens, branches: shownBranches, notes, chapter, onSaveNote, onExplore, onAction, onAlternatives, onFundgrube, onOpenChapter }: { lens: string; setLens: (value: string) => void; branches: Branch[]; notes: PrivateNote[]; chapter: number; onSaveNote: (question: string, text: string) => boolean; onExplore: (branch: Branch) => void; onAction: (message: string, action: string) => void; onAlternatives: () => void; onFundgrube: () => void; onOpenChapter: (chapter: number) => void }) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const saveQuestion = () => {
    if (!openQuestion || !draft.trim()) return
    if (!onSaveNote(openQuestion, draft)) return
    setDraft('')
    setOpenQuestion(null)
  }
  return <div className="panel-content result">
    <section><div className="section-title"><h3>Fundstücke</h3><span className="count">{findings.length}</span></div>{findings.map(finding => <article className="finding" key={finding.title}><span>{finding.label}</span><h4>{finding.title}</h4><p>{finding.text}</p><SourceLine sources={finding.sources} onOpenChapter={onOpenChapter} /><button className="fundgrube-link" onClick={onFundgrube}>In der Fundgrube ansehen <ArrowLeft className="arrow-right" size={13} /></button></article>)}</section>
    <section><div className="section-title"><h3>Fragen an dich</h3></div><ol className="questions">{questions.map((question, index) => { const hasNote = notes.some(note => note.chapter === chapter && note.question === question); const isOpen = openQuestion === question; return <li key={question}><span className="question-number">{index + 1}</span><div><button onClick={() => { setOpenQuestion(isOpen ? null : question); setDraft('') }}>{question}</button>{isOpen && <div className="question-note-entry"><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Deine Gedanken (nur für dich) …" aria-label={`Notiz zu: ${question}`} /><div><button className="save-note" disabled={!draft.trim()} onClick={saveQuestion}>Merken</button><button onClick={() => { setOpenQuestion(null); setDraft('') }}>Abbrechen</button></div></div>}{hasNote && !isOpen && <small className="question-saved">✓ Notiz gemerkt</small>}</div></li> })}</ol></section>
    <section><div className="section-title"><h3>Was wäre wenn …</h3><span className="ai-tag" aria-label="KI-Hinweis"><Sparkles size={11} /></span></div><div className="branch-list">{shownBranches.map(branch => <article className="branch-card" key={branch.id}><h4>{branch.title}</h4><p>{branch.description}</p><small>{branch.source}</small><div className="branch-actions"><button className="branch-primary" onClick={() => onExplore(branch)}>Spuren suchen</button><button onClick={() => onAction(`„${branch.title}“ wurde als Notiz abgelegt.`, 'Notiz übernommen')}>Notiz</button><button onClick={() => onAction(`„${branch.title}“ wurde für später vorgemerkt.`, 'Für später vorgemerkt')}><Clock3 size={14} /></button><button onClick={() => onAction(`„${branch.title}“ wird nicht mehr angezeigt.`, 'Verworfen')}>Verwerfen</button></div></article>)}</div><button className="text-button" onClick={onAlternatives}>Andere Zweige zeigen <ArrowLeft className="arrow-right" size={15} /></button></section>
    <section className="lens"><h3>Linse</h3><div className="chips">{['neutral', 'aus Miras Sicht', 'aus Teos Sicht'].map(value => <Chip key={value} active={lens === value} onClick={() => setLens(value)}>{value}</Chip>)}</div></section>
  </div>
}

function BranchContinuation({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== value) editorRef.current.innerText = value
  }, [value])
  return <section className="branch-continuation"><p>Spur gelegt in Kap. 2 · Du kannst hier weiterschreiben.</p><div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Im Zweig Bruder weiterschreiben" data-placeholder="Schreib weiter …" title={value ? 'Neu im Zweig „Bruder“ · von dir geschrieben' : undefined} className={`continuation-editor ${value ? 'has-text' : ''}`} onInput={event => onChange(event.currentTarget.innerText)} /></section>
}

function MarginNote({ note, editing, onEdit, onCancel, onUpdate, onDelete }: { note: PrivateNote; editing: boolean; onEdit: () => void; onCancel: () => void; onUpdate: (id: string, text: string) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState(note.text)
  useEffect(() => { setDraft(note.text) }, [note.text])
  return <aside className="margin-note" aria-label="Private Notiz"><div className="margin-note-top"><span>Notiz</span><button onClick={() => setMenuOpen(current => !current)} aria-label="Notiz-Menü">•••</button>{menuOpen && <div className="margin-note-menu"><button onClick={() => { setMenuOpen(false); onEdit() }}>Bearbeiten</button><button onClick={() => { setMenuOpen(false); onDelete(note.id) }}>Löschen</button></div>}</div><small>{note.question}</small>{editing ? <><textarea value={draft} onChange={event => setDraft(event.target.value)} aria-label="Notiz bearbeiten" /><div className="margin-note-actions"><button onClick={() => onUpdate(note.id, draft.trim())} disabled={!draft.trim()}>Speichern</button><button onClick={onCancel}>Abbrechen</button></div></> : <p>{note.text}</p>}</aside>
}

function EmptyPanel({ onClose, onExpand }: { onClose: () => void; onExpand: () => void }) { return <div className="panel-content empty-state"><div className="empty-icon"><Search size={25} /></div><h3>Hier finde ich keinen offenen Faden.</h3><p>Möchtest du den Bereich erweitern?</p><button className="primary-button" onClick={onExpand}>Ganzes Manuskript prüfen</button><button className="text-button" onClick={onClose}>Schließen</button></div> }

function BoundaryPanel({ onQuestions, onPerspective }: { onQuestions: () => void; onPerspective: () => void }) { return <div className="panel-content boundary"><div className="request-bubble"><span>LENA</span><p>„Schreib mir die Szene.“</p></div><div className="boundary-answer"><Sparkles size={18} /><p>Ich schreibe keine Prosa, damit es deine Geschichte bleibt. Ich kann dir Fragen stellen oder die Szene aus einer anderen Perspektive betrachten.</p></div><button className="primary-button" onClick={onQuestions}>Fragen stellen</button><button className="secondary-button" onClick={onPerspective}>Perspektive wechseln</button></div> }

function CluesPanel({ selected, setSelected, clueStates, setClueStates, onChange, onSave }: { selected: number | null; setSelected: (value: number | null) => void; clueStates: Record<number, ClueStatus>; setClueStates: React.Dispatch<React.SetStateAction<Record<number, ClueStatus>>>; onChange: () => void; onSave: () => void }) {
  const [detailIndex, setDetailIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const checkedCount = Object.keys(clueStates).length
  const savedCount = Object.values(clueStates).filter(clue => clue.status === 'saved').length
  const openDetail = (index: number) => { setDetailIndex(index); setDraft(clueStates[index]?.text ?? '') }
  const saveTrace = () => {
    if (detailIndex === null || !draft.trim()) return
    setClueStates(current => ({ ...current, [detailIndex]: { status: 'saved', text: draft.trim() } }))
    setSelected(detailIndex)
    setDetailIndex(null)
    onChange()
  }
  const skipTrace = (index: number) => {
    setClueStates(current => ({ ...current, [index]: { status: 'skipped', text: '' } }))
    setDetailIndex(null)
    onChange()
  }
  const reactivateTrace = (index: number) => {
    setClueStates(current => {
      const { [index]: removed, ...remaining } = current
      return remaining
    })
    onChange()
  }
  if (detailIndex !== null) {
    const clue = clues[detailIndex]
    const [before, after] = clue.context.split(clue.excerpt)
    return <div className="panel-content clue-detail"><div className="clue-detail-top"><strong>Kap. {clue.chapter} · S. {clue.page}</strong><button onClick={() => setDetailIndex(null)}>← Zurück zur Liste</button></div><p className="clue-manuscript">{before}<mark>{clue.excerpt}</mark>{after}{draft && <><span className="author-trace"> {draft}</span><small className="author-trace-label">von dir geschrieben</small></>}</p><label>Deine Spur<textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Schreib hier deinen Hinweis …" /></label><button className="author-save-trace" disabled={!draft.trim()} onClick={saveTrace}>Als Alternative speichern</button></div>
  }
  return <div className="panel-content clues"><div className="clue-intro"><span className="ai-label"><Sparkles size={13} /> KI-IMPULS</span><h3>Ein Bruder existiert</h3><p>Diese fünf Stellen könnten Platz für einen Hinweis bieten. Du entscheidest, ob und was du dort selbst schreibst.</p></div><div className="progress"><span>Spuren prüfen</span><strong>{checkedCount} / 5</strong><div><i style={{ width: `${(checkedCount / 5) * 100}%` }} /></div></div><div className="clue-list">{clues.map((clue, index) => { const state = clueStates[index]; return <article key={clue.chapter} className={`clue ${selected === index ? 'chosen' : ''} ${state?.status ?? ''}`}><button className="clue-toggle" onClick={() => setSelected(selected === index ? null : index)}><span><b>Kap. {clue.chapter}</b> · S. {clue.page}</span><ChevronDown size={16} /></button><p>„{clue.excerpt}“</p><div className="why"><Lightbulb size={15} /><span><b>Warum hier?</b>{clue.reason}</span></div><div className="clue-actions"><button onClick={() => openDetail(index)}>Zur Stelle springen</button>{state?.status === 'skipped' ? <><span>Ausgelassen</span><button className="reactivate-trace" onClick={() => reactivateTrace(index)}>Wieder aktivieren</button></> : <button onClick={() => skipTrace(index)}>Auslassen</button>}</div>{state?.status === 'saved' && <small className="trace-saved">✓ Spur gelegt</small>}</article> })}</div><button className="primary-button clue-save-branch" disabled={savedCount === 0} onClick={onSave}>Zweig „Bruder“ sichern</button></div>
}
