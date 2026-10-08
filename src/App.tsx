import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, CircleHelp, Clock3, FileText, Lightbulb, Plus, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { alternativeBranches, assumption, branches, chapterManuscripts, chapters, clues, findings, fundgrubeContradiction, fundgrubeFigures, fundgrubeFindings, fundgrubePlaces, fundgrubeThreads, loadingSteps, manuscript, questions, versionHistory, versionsBranches, type Branch } from './data/mock'

type PanelState = 'input' | 'loading' | 'result' | 'empty' | 'boundary' | 'clues'
type Feedback = { message: string; action: string } | null
type Page = 'schreibraum' | 'fundgrube' | 'versionen'
type FundgrubeView = 'Übersicht' | 'Figuren' | 'Orte' | 'Offene Fäden' | 'Widersprüche'
type ManuscriptSelection = { start: number; end: number; text: string }

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

const panelLabels: Record<PanelState, string> = {
  input: 'Eingabe', loading: 'Lädt', result: 'Ergebnis', empty: 'Nichts gefunden', boundary: 'Grenzfall', clues: 'Spuren legen',
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function SourceLine({ sources }: { sources: { chapter: number; page: number }[] }) {
  return <button className="source">Quelle: {sources.map((source, i) => <span key={`${source.chapter}-${source.page}`}>Kap. {source.chapter}, S. {source.page}{i < sources.length - 1 ? ' · ' : ''}</span>)} ↗</button>
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

export default function App() {
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [scope, setScope] = useState('Kap. 1–18')
  const [intent, setIntent] = useState<string | null>(null)
  const [editingAssumption, setEditingAssumption] = useState(false)
  const [assumptionText, setAssumptionText] = useState(assumption)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [volume, setVolume] = useState('leise')
  const [selectedLens, setSelectedLens] = useState('neutral')
  const [selectedClue, setSelectedClue] = useState<number | null>(null)
  const [branchSaved, setBranchSaved] = useState(false)
  const [fundgrubeBadge, setFundgrubeBadge] = useState(0)
  const [page, setPage] = useState<Page>('schreibraum')
  const [manuscriptSelection, setManuscriptSelection] = useState<ManuscriptSelection | null>(initialManuscriptSelection)
  const manuscriptRef = useRef<HTMLElement>(null)
  const [activeChapter, setActiveChapter] = useState(18)
  const currentManuscript = chapterManuscripts[activeChapter]
  const selectedText = manuscriptSelection?.text ?? ''
  const selectedFigures = figuresInText(selectedText)
  const understandingContextRef = useRef('')

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        const states: PanelState[] = ['input', 'loading', 'result', 'empty', 'boundary', 'clues']
        setPanel(current => states[(states.indexOf(current ?? 'input') + 1) % states.length])
      }
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

  useEffect(() => {
    if (panel === 'result') setFundgrubeBadge(3)
  }, [panel])

  useEffect(() => {
    if (scope.startsWith('Figur:') && !selectedFigures.some(figure => scope === `Figur: ${figure}`)) setScope('Kap. 1–18')
  }, [scope, selectedText])

  useEffect(() => {
    const context = `${selectedText}::${intent ?? ''}::${scope}`
    if (!editingAssumption && understandingContextRef.current !== context) {
      setAssumptionText(understoodText(selectedText, intent, scope))
      understandingContextRef.current = context
    }
  }, [selectedText, intent, scope, editingAssumption])

  const openPanel = () => { setPanel('input'); setFeedback(null); setIntent(null); setScope('Kap. 1–18'); setEditingAssumption(false) }
  const act = (message: string, action: string) => setFeedback({ message, action })
  const undo = () => { setFeedback(null); setBranchSaved(false) }
  const exploreBranch = (branch: Branch) => {
    if (branch.id === 'brother') { setPanel('clues'); setFeedback(null) }
    else act(`„${branch.title}“ bleibt als Möglichkeit sichtbar.`, 'Gemerkte Möglichkeit')
  }
  const captureSelection = () => {
    const root = manuscriptRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed || !selection.anchorNode || !selection.focusNode || !root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) return
    const range = selection.getRangeAt(0)
    const paragraphs = Array.from(root.querySelectorAll<HTMLElement>('[data-manuscript-paragraph]'))
    const textPosition = (node: Node, offset: number) => {
      const paragraphIndex = paragraphs.findIndex(paragraph => paragraph.contains(node))
      if (paragraphIndex === -1) return null
      const withinParagraph = document.createRange()
      withinParagraph.selectNodeContents(paragraphs[paragraphIndex])
      withinParagraph.setEnd(node, offset)
      return paragraphs.slice(0, paragraphIndex).reduce((total, paragraph) => total + (paragraph.textContent?.length ?? 0), 0) + withinParagraph.toString().length
    }
    const start = textPosition(range.startContainer, range.startOffset)
    const end = textPosition(range.endContainer, range.endOffset)
    const text = range.toString().trim()
    if (!text || start === null || end === null) return
    setManuscriptSelection({ start, end, text })
    window.setTimeout(() => selection.removeAllRanges(), 0)
  }

  if (page === 'fundgrube') {
    return <Fundgrube volume={volume} setVolume={setVolume} notificationCount={fundgrubeBadge} onWritingRoom={() => setPage('schreibraum')} onVersions={() => setPage('versionen')} />
  }
  if (page === 'versionen') {
    return <Versions volume={volume} setVolume={setVolume} notificationCount={fundgrubeBadge} onWritingRoom={() => setPage('schreibraum')} onFundgrube={() => setPage('fundgrube')} />
  }

  return (
    <main className={`app ${panel ? 'panel-open' : ''}`}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
        <ProjectSwitcher />
        <nav aria-label="Projektbereiche"><button className="nav-link current">Schreibraum</button><button className="nav-link" onClick={() => { setPanel(null); setPage('fundgrube') }}>Fundgrube {fundgrubeBadge > 0 && <span className="new-dot">{fundgrubeBadge}</span>}</button><button className="nav-link" onClick={() => { setPanel(null); setPage('versionen') }}>Versionen & Zweige</button></nav>
        <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={e => setVolume(e.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title"><span>MANUSKRIPT</span><button aria-label="Kapitel hinzufügen"><Plus size={17} /></button></div>
          <div className="book-title"><FileText size={16} /> Der Sommer der Könige</div>
          <div className="chapter-list">{chapters.map(chapter => <button key={chapter.number} onClick={() => { setActiveChapter(chapter.number); setManuscriptSelection(chapter.number === 18 ? initialManuscriptSelection : null); setPanel(null) }} className={`chapter ${activeChapter === chapter.number ? 'selected' : ''}`}><span>Kap. {chapter.number}</span><span>{chapter.title}</span><small>S. {chapter.page}</small></button>)}</div>
          <div className="sidebar-bottom"><button><Search size={16} />Durchsuchen</button><button><CircleHelp size={16} />Hilfe & Feedback</button></div>
        </aside>

        <section className="editor" aria-label="Manuskript" onClick={event => { if (event.target === event.currentTarget) setManuscriptSelection(null) }}>
          <div className="editor-meta"><span>Kapitel {activeChapter}</span><span>·</span><span>Seite {currentManuscript.page}</span><span className="saved">Gespeichert</span></div>
          <article className="manuscript" ref={manuscriptRef} onMouseUp={captureSelection} onClick={event => { if (event.target === event.currentTarget) setManuscriptSelection(null) }}>
            <h1>{currentManuscript.title}</h1>
            {(() => { let offset = 0; return currentManuscript.paragraphs.map(paragraph => { const start = offset; offset += paragraph.length; const actionAfter = manuscriptSelection && manuscriptSelection.end > start && manuscriptSelection.end <= offset; return <div key={paragraph}><p data-manuscript-paragraph>{selectionParts(paragraph, start, manuscriptSelection)}</p>{actionAfter && <div className="selection-actions"><span>Markierte Stelle</span><button onClick={openPanel}><Sparkles size={15} />Innehalten zu dieser Stelle</button></div>}</div> }) })()}
          </article>
          {branchSaved && <div className="branch-note"><span className="check">✓</span> Gespeichert im Zweig <strong>„Bruder“</strong> · Original bleibt</div>}
          <button className="pause-button" onClick={openPanel}><span className="pause-icon">Ⅱ</span> Innehalten</button>
        </section>

        {panel && <aside className="ai-panel" aria-label="Innehalten-Panel">
          <div className="panel-header"><div><div className="eyebrow ai-label"><Sparkles size={13} /> KI-IMPULS</div><h2>{panel === 'clues' ? 'Spuren legen' : 'Innehalten'} <span>· Kap. {activeChapter}</span></h2></div><button className="icon-button" onClick={() => setPanel(null)} aria-label="Panel schließen"><X size={20} /></button></div>
          {panel !== 'input' && panel !== 'clues' && <div className="panel-context">Bezieht sich auf <strong>{scope}</strong></div>}
          {panel === 'input' && <InputPanel selectionText={selectedText} figureNames={selectedFigures} scope={scope} setScope={setScope} intent={intent} setIntent={setIntent} editing={editingAssumption} setEditing={setEditingAssumption} assumptionText={assumptionText} setAssumptionText={setAssumptionText} onStart={() => setPanel('loading')} onBoundary={() => setPanel('boundary')} />}
          {panel === 'loading' && <LoadingPanel onCancel={() => setPanel('input')} />}
          {panel === 'result' && <ResultPanel lens={selectedLens} setLens={setSelectedLens} branches={showAlternatives ? alternativeBranches : branches} onExplore={exploreBranch} onAction={act} onAlternatives={() => setShowAlternatives(true)} />}
          {panel === 'empty' && <EmptyPanel onClose={() => setPanel(null)} onExpand={() => { setScope('Ganzes Manuskript'); setPanel('loading') }} />}
          {panel === 'boundary' && <BoundaryPanel onQuestions={() => { setIntent('Was habe ich vergessen?'); setPanel('loading') }} onPerspective={() => { setIntent('Perspektive wechseln'); setPanel('input') }} />}
          {panel === 'clues' && <CluesPanel selected={selectedClue} setSelected={setSelectedClue} onSave={() => { setBranchSaved(true); setFeedback({ message: 'Der Zweig ist gesichert. Das Original wurde nicht verändert.', action: 'Zweig „Bruder“' }); setPanel(null) }} />}
          {panel !== 'clues' && <div className="panel-footer"><button onClick={undo} disabled={!feedback}><RotateCcw size={15} />Rückgängig</button><button onClick={() => setPanel(null)}>Panel schließen</button></div>}
          {feedback && <div className="toast"><span>✓</span><div><strong>{feedback.action}</strong><p>{feedback.message}</p></div><button onClick={undo} aria-label="Rückmeldung schließen"><X size={15} /></button></div>}
          <div className="demo-hint">Demo: Taste <kbd>D</kbd> wechselt zu „{panelLabels[panel]}“</div>
        </aside>}
      </div>
    </main>
  )
}

function Versions({ volume, setVolume, notificationCount, onWritingRoom, onFundgrube }: { volume: string; setVolume: (value: string) => void; notificationCount: number; onWritingRoom: () => void; onFundgrube: () => void }) {
  const [activeBranch, setActiveBranch] = useState('brother')
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const active = versionsBranches.find(branch => branch.id === activeBranch) ?? versionsBranches[1]
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2600) }
  return <main className="app versions-app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
      <ProjectSwitcher />
      <span className="active-branch-pill">⌘ Zweig: Bruder⌄</span>
      <nav aria-label="Projektbereiche"><button className="nav-link" onClick={onWritingRoom}>Schreibraum</button><button className="nav-link" onClick={onFundgrube}>Fundgrube {notificationCount > 0 && <span className="new-dot">{notificationCount}</span>}</button><button className="nav-link current">Versionen & Zweige</button></nav>
      <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={event => setVolume(event.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
    </header>
    <div className="versions-layout">
      <aside className="versions-sidebar"><div className="side-title"><span>ZWEIGE</span></div>{versionsBranches.map(branch => <button key={branch.id} className={activeBranch === branch.id ? 'active' : ''} onClick={() => setActiveBranch(branch.id)}><i className={branch.id === 'brother' ? 'green' : ''} /><span><strong>{branch.name}</strong><small>{branch.detail}</small></span></button>)}<div className="versions-note">Nichts geht verloren. Jede Änderung wird automatisch gesichert, das Original bleibt immer erhalten.</div></aside>
      <section className="versions-content"><div className="versions-heading"><div className="eyebrow author-label">NICHTS GEHT VERLOREN</div><h1>Versionen & Zweige</h1><p>Probier Ideen aus, ohne etwas zu riskieren. Der Zweig „Bruder“ ist gerade aktiv.</p></div>
        <section className="comparison-card"><div className="comparison-title"><strong>Zweig-Vergleich · Kap. 2 „Zwei Brüder im Schnee“</strong><span><Sparkles size={11} /> Unterschiede markiert</span></div><div className="compare-texts"><article><label>ORIGINAL · HAUPTLINIE</label><p>Der König sprach selten von seiner Kindheit. Wenn er es doch tat, dann nur vom Winter im Nordhof und vom Schnee, der alle Spuren verwischte.</p></article><article className="branch-version"><label>ZWEIG „BRUDER“</label><p>Der König sprach selten von seiner Kindheit. Wenn er es doch tat, dann nur vom Winter im Nordhof und vom Schnee, der alle Spuren verwischte. <mark>„Wir waren zwei“, sagte er einmal, und schwieg danach so lange, dass niemand nachzufragen wagte.</mark></p><small>+1 Satz · von dir geschrieben</small></article></div><div className="compare-actions"><button className="author-primary" onClick={() => notify('In die Hauptlinie übernommen')}>Zweig übernehmen</button><button>Im Zweig weiterschreiben</button><button onClick={() => setConfirmDiscard(true)}>Zweig verwerfen</button></div>{confirmDiscard && <div className="discard-confirm"><span>Wirklich verwerfen? Das Original bleibt erhalten.</span><button onClick={() => { setConfirmDiscard(false); notify('Zweig verworfen') }}>Verwerfen</button><button onClick={() => setConfirmDiscard(false)}>Abbrechen</button></div>}</section>
        <div className="versions-columns"><section className="history"><div className="history-title"><h2>Verlauf</h2><span>automatisch gesichert</span></div><div className="history-card">{versionHistory.map(item => <article key={item.title}><i className={item.tone} /><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className={item.tone === 'author' || item.tone === 'branch' ? 'branch-badge' : 'main-badge'}>{item.branch}</span><button onClick={() => notify('Version wiederhergestellt')}>Wiederherstellen</button></article>)}</div></section><aside><section className="branch-summary"><h2>{active.name}</h2><p>Entstanden aus:</p><strong>Innehalten · Kap. 18 · „Ein Bruder existiert“</strong><p>Spuren gelegt: 2 von 5 Stellen</p><div className="branch-progress"><i /></div><button>Weitere Spuren legen ↗</button></section><section className="saved-info"><h2>Was gesichert wird</h2><ul><li>jede Änderung, automatisch</li><li>das Original bleibt immer erhalten</li><li>Zweige übernimmt nur du</li></ul><small>KI · automatisieren: sichert und markiert. Entscheiden: nur du.</small></section></aside></div>
      </section>
    </div>{notice && <div className="versions-toast">✓ {notice}</div>}
  </main>
}

function Fundgrube({ volume, setVolume, notificationCount, onWritingRoom, onVersions }: { volume: string; setVolume: (value: string) => void; notificationCount: number; onWritingRoom: () => void; onVersions: () => void }) {
  const [view, setView] = useState<FundgrubeView>('Übersicht')
  const [findingsState, setFindingsState] = useState<Record<string, 'new' | 'confirmed' | 'removed'>>({})
  const [threadStatus, setThreadStatus] = useState(() => Object.fromEntries(fundgrubeThreads.map(thread => [thread.id, thread.status])) as Record<string, string>)
  const [contradictionVisible, setContradictionVisible] = useState(true)
  const visibleFindings = fundgrubeFindings.filter(finding => findingsState[finding.id] !== 'removed')
  const newCount = fundgrubeFindings.filter(finding => !findingsState[finding.id] || findingsState[finding.id] === 'new').length
  const cycleStatus = (id: string) => setThreadStatus(current => ({ ...current, [id]: current[id] === 'offen' ? 'bewusst offen' : current[id] === 'bewusst offen' ? 'loslassen' : 'offen' }))
  const show = (name: FundgrubeView) => view === 'Übersicht' || view === name

  return <main className="app fundgrube-app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
      <ProjectSwitcher />
      <nav aria-label="Projektbereiche"><button className="nav-link" onClick={onWritingRoom}>Schreibraum</button><button className="nav-link current">Fundgrube {notificationCount > 0 && <span className="new-dot">{newCount}</span>}</button><button className="nav-link" onClick={onVersions}>Versionen & Zweige</button></nav>
      <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={event => setVolume(event.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
    </header>
    <div className="fundgrube-layout">
      <aside className="fundgrube-sidebar"><div className="side-title"><span>FUNDGRUBE</span></div>{(['Übersicht', 'Figuren', 'Orte', 'Offene Fäden', 'Widersprüche'] as FundgrubeView[]).map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}<span>{item === 'Figuren' ? 6 : item === 'Orte' ? 4 : item === 'Offene Fäden' ? 5 : item === 'Widersprüche' ? 1 : ''}</span></button>)}<div className="gathered-note">Still gesammelt aus Kap. 1–18.<br />Nichts ändert deinen Text.</div></aside>
      <section className="fundgrube-content">
        <div className="fundgrube-heading"><div><div className="eyebrow ai-label"><Sparkles size={13} /> STILL GESAMMELT</div><h1>{view}</h1><p>{view === 'Übersicht' ? <>Was deine Geschichte bisher enthält · bezieht sich auf <strong>Kap. 1–18</strong></> : 'Was deine Geschichte bisher enthält'}</p></div>{view === 'Übersicht' && <div className="fund-filter"><Chip active>Alle</Chip><Chip>Neu · {newCount}</Chip><Chip>Bestätigt</Chip></div>}</div>
        {view === 'Übersicht' && <section className="new-findings"><div className="new-findings-title"><strong>{newCount} neue Fundstücke</strong><span>Du entscheidest, was bleibt.</span></div><div className="new-finding-grid">{visibleFindings.map(finding => <article className="new-finding" key={finding.id}><div className="finding-top"><span>{finding.type}</span>{findingsState[finding.id] === 'confirmed' ? <em>bestätigt</em> : <em><Sparkles size={11} /> von KI gefunden</em>}</div><h3>{finding.title}</h3><button className="fund-source">Quelle: {finding.source}</button><div><button className="confirm" onClick={() => setFindingsState(current => ({ ...current, [finding.id]: 'confirmed' }))}>Bestätigen</button><button>Bearbeiten</button><button onClick={() => setFindingsState(current => ({ ...current, [finding.id]: 'removed' }))}>Entfernen</button></div></article>)}</div></section>}
        <div className="fundgrube-columns">
          <div>
            {show('Figuren') && <FundgrubeFigures />}
            {show('Orte') && <FundgrubePlaces />}
          </div>
          <div>
            {show('Offene Fäden') && <FundgrubeThreads statuses={threadStatus} onCycle={cycleStatus} />}
            {show('Widersprüche') && contradictionVisible && <FundgrubeContradiction onDismiss={() => setContradictionVisible(false)} />}
          </div>
        </div>
      </section>
    </div>
  </main>
}

function FundgrubeFigures() { return <section className="fund-section"><div className="fund-section-title"><h2>Figuren</h2><button>Alle 6 ansehen</button></div><div className="figure-grid">{fundgrubeFigures.map(figure => <article className="figure-card" key={figure.name}><div><h3>{figure.name}</h3><span>bestätigt</span></div><p>{figure.role}</p><small>Erwähnt: {figure.mentioned}</small><div className="figure-tags">{figure.tags.map(tag => <i key={tag}>{tag}</i>)}</div></article>)}</div></section> }

function FundgrubePlaces() { return <section className="fund-section"><div className="fund-section-title"><h2>Orte</h2><button>Alle 4 ansehen</button></div><div className="places-card">{fundgrubePlaces.map(place => <div key={place.name}><span><strong>{place.name}</strong><small>{place.type}</small></span><small>{place.chapters}</small></div>)}</div></section> }

function FundgrubeThreads({ statuses, onCycle }: { statuses: Record<string, string>; onCycle: (id: string) => void }) { return <section className="threads-card"><h2>Offene Fäden</h2><p>Den Status setzt nur du.</p>{fundgrubeThreads.map(thread => <article key={thread.id}><div><h3>{thread.title}</h3><button className="fund-source">{thread.source}</button></div><button className={`thread-status ${statuses[thread.id].replace(' ', '-')}`} onClick={() => onCycle(thread.id)}>{statuses[thread.id]}⌄</button></article>)}</section> }

function FundgrubeContradiction({ onDismiss }: { onDismiss: () => void }) { return <section className="contradiction-card"><div className="contradiction-title"><h2>Möglicher Widerspruch</h2><span><Sparkles size={11} /> KI-Hinweis</span></div><h3>{fundgrubeContradiction.title}</h3><p>Vielleicht Absicht. Du entscheidest.</p><button className="confirm">Zu den Stellen</button><button onClick={onDismiss}>Ist Absicht</button></section> }

function InputPanel(props: { selectionText: string; figureNames: string[]; scope: string; setScope: (value: string) => void; intent: string | null; setIntent: (value: string | null) => void; editing: boolean; setEditing: (value: boolean) => void; assumptionText: string; setAssumptionText: (value: string) => void; onStart: () => void; onBoundary: () => void }) {
  const [draft, setDraft] = useState(props.assumptionText)
  useEffect(() => { if (!props.editing) setDraft(props.assumptionText) }, [props.assumptionText, props.editing])
  const intentHelp: Record<string, string> = {
    'Ich stecke fest': 'Ich zeige dir Möglichkeiten, wie es weitergehen könnte.',
    'Was habe ich vergessen?': 'Ich suche offene Fäden und vergessene Figuren.',
    'Perspektive wechseln': 'Ich zeige dir die Szene aus der Sicht einer Figur.',
  }
  const scopes = ['Kap. 1–18', 'nur dieses Kapitel', ...props.figureNames.map(name => `Figur: ${name}`)]
  return <div className="panel-content input-panel"><section className="selected-text"><div className="input-section-heading"><i>1</i><h3>Deine Stelle</h3></div><p>{props.selectionText ? `„${props.selectionText}“` : 'Markiere eine Stelle im Text.'}</p></section><section><div className="input-section-heading"><i>2</i><h3>Was brauchst du?</h3></div><div className="chips">{['Ich stecke fest', 'Was habe ich vergessen?', 'Perspektive wechseln'].map(value => <Chip key={value} active={props.intent === value} onClick={() => props.setIntent(value)}>{value}</Chip>)}</div><p className="input-hint">{props.intent ? intentHelp[props.intent] : 'Wähle zuerst, wobei ich dir helfen soll.'}</p></section><section><div className="input-section-heading"><i>3</i><h3>Wo soll ich suchen?</h3></div><div className="chips">{scopes.map(value => <Chip key={value} active={props.scope === value} onClick={() => props.setScope(value)}>{value}</Chip>)}</div><p className="input-hint">Figuren-Chips kommen aus deiner markierten Stelle.</p></section>{props.intent && <section><div className="input-section-heading"><i>4</i><h3>So verstehe ich dich</h3></div><div className="assumption"><div className="assumption-title"><span>KI</span>{!props.editing && <button onClick={() => { setDraft(props.assumptionText); props.setEditing(true) }}>Korrigieren</button>}</div>{props.editing ? <><textarea aria-label="KI-Verständnis korrigieren" value={draft} onChange={event => setDraft(event.target.value)} /><div className="assumption-actions"><button onClick={() => { props.setAssumptionText(draft); props.setEditing(false) }}>Bestätigen</button><button onClick={() => { setDraft(props.assumptionText); props.setEditing(false) }}>Abbrechen</button></div></> : <p>{props.assumptionText}</p>}<label className="optional-question">Eigene Frage (optional)<input placeholder="Optional" onChange={event => { if (event.target.value.toLowerCase().includes('schreib')) props.onBoundary() }} /></label></div></section>}<button className="primary-button" disabled={!props.intent} onClick={props.onStart}><Sparkles size={17} />Innehalten</button></div>
}

function LoadingPanel({ onCancel }: { onCancel: () => void }) { return <div className="panel-content loading"><div className="loading-orbit"><span></span><Sparkles size={23} /></div><h3>Ich sehe mir deine Spuren an</h3><p>Ich prüfe nur den gewählten Bereich und ändere nichts an deinem Text.</p><ul>{loadingSteps.map((step, index) => <li key={step} className={index < 2 ? 'done' : 'working'}><span>{index < 2 ? '✓' : '…'}</span>{step}</li>)}</ul><button className="secondary-button" onClick={onCancel}>Abbrechen</button></div> }

function ResultPanel({ lens, setLens, branches: shownBranches, onExplore, onAction, onAlternatives }: { lens: string; setLens: (value: string) => void; branches: Branch[]; onExplore: (branch: Branch) => void; onAction: (message: string, action: string) => void; onAlternatives: () => void }) { return <div className="panel-content result"><section><div className="section-title"><h3>Fundstücke</h3><span className="count">{findings.length}</span></div>{findings.map(finding => <article className="finding" key={finding.title}><span>{finding.label}</span><h4>{finding.title}</h4><p>{finding.text}</p><SourceLine sources={finding.sources} /></article>)}</section><section><div className="section-title"><h3>Fragen an dich</h3></div><ol className="questions">{questions.map(question => <li key={question}><button onClick={() => onAction('Als private Notiz gesichert. Dein Manuskript bleibt unverändert.', 'Notiz übernommen')}>{question}</button></li>)}</ol></section><section><div className="section-title"><h3>Was wäre wenn …</h3><span className="ai-tag">KI</span></div><div className="branch-list">{shownBranches.map(branch => <article className="branch-card" key={branch.id}><h4>{branch.title}</h4><p>{branch.description}</p><small>{branch.source}</small><div className="branch-actions"><button className="branch-primary" onClick={() => onExplore(branch)}>Spuren suchen</button><button onClick={() => onAction(`„${branch.title}“ wurde als Notiz abgelegt.`, 'Notiz übernommen')}>Notiz</button><button onClick={() => onAction(`„${branch.title}“ wurde für später vorgemerkt.`, 'Für später vorgemerkt')}><Clock3 size={14} /></button><button onClick={() => onAction(`„${branch.title}“ wird nicht mehr angezeigt.`, 'Verworfen')}>Verwerfen</button></div></article>)}</div><button className="text-button" onClick={onAlternatives}>Andere Zweige zeigen <ArrowLeft className="arrow-right" size={15} /></button></section><section className="lens"><h3>Linse</h3><div className="chips">{['neutral', 'aus Miras Sicht', 'aus Teos Sicht'].map(value => <Chip key={value} active={lens === value} onClick={() => setLens(value)}>{value}</Chip>)}</div></section></div> }

function EmptyPanel({ onClose, onExpand }: { onClose: () => void; onExpand: () => void }) { return <div className="panel-content empty-state"><div className="empty-icon"><Search size={25} /></div><h3>Hier finde ich keinen offenen Faden.</h3><p>Möchtest du den Bereich erweitern?</p><button className="primary-button" onClick={onExpand}>Ganzes Manuskript prüfen</button><button className="text-button" onClick={onClose}>Schließen</button></div> }

function BoundaryPanel({ onQuestions, onPerspective }: { onQuestions: () => void; onPerspective: () => void }) { return <div className="panel-content boundary"><div className="request-bubble"><span>LENA</span><p>„Schreib mir die Szene.“</p></div><div className="boundary-answer"><Sparkles size={18} /><p>Ich schreibe keine Prosa, damit es deine Geschichte bleibt. Ich kann dir Fragen stellen oder die Szene aus einer anderen Perspektive betrachten.</p></div><button className="primary-button" onClick={onQuestions}>Fragen stellen</button><button className="secondary-button" onClick={onPerspective}>Perspektive wechseln</button></div> }

function CluesPanel({ selected, setSelected, onSave }: { selected: number | null; setSelected: (value: number | null) => void; onSave: () => void }) { return <div className="panel-content clues"><div className="clue-intro"><span className="ai-label"><Sparkles size={13} /> KI-IMPULS</span><h3>Ein Bruder existiert</h3><p>Diese fünf Stellen könnten Platz für einen Hinweis bieten. Du entscheidest, ob und was du dort selbst schreibst.</p></div><div className="progress"><span>Spuren prüfen</span><strong>{selected === null ? 0 : selected + 1} / 5</strong><div><i style={{ width: `${selected === null ? 0 : ((selected + 1) / 5) * 100}%` }} /></div></div><div className="clue-list">{clues.map((clue, index) => <article key={clue.chapter} className={`clue ${selected === index ? 'chosen' : ''}`}><button className="clue-toggle" onClick={() => setSelected(selected === index ? null : index)}><span><b>Kap. {clue.chapter}</b> · S. {clue.page}</span><ChevronDown size={16} /></button><p>„{clue.excerpt}“</p><div className="why"><Lightbulb size={15} /><span><b>Warum hier?</b>{clue.reason}</span></div><div className="clue-actions"><button onClick={() => setSelected(index)}>Zur Stelle springen</button><button>Auslassen</button></div></article>)}</div><button className="primary-button" onClick={onSave}>Zweig „Bruder“ sichern</button></div> }
