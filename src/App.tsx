import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, CircleHelp, Clock3, FileText, Lightbulb, Plus, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { alternativeBranches, assumption, branches, chapters, clues, findings, fundgrubeContradiction, fundgrubeFigures, fundgrubeFindings, fundgrubePlaces, fundgrubeThreads, loadingSteps, manuscript, questions, type Branch } from './data/mock'

type PanelState = 'input' | 'loading' | 'result' | 'empty' | 'boundary' | 'clues'
type Feedback = { message: string; action: string } | null
type Page = 'schreibraum' | 'fundgrube'
type FundgrubeView = 'Übersicht' | 'Figuren' | 'Orte' | 'Offene Fäden' | 'Widersprüche'

const panelLabels: Record<PanelState, string> = {
  input: 'Eingabe', loading: 'Lädt', result: 'Ergebnis', empty: 'Nichts gefunden', boundary: 'Grenzfall', clues: 'Spuren legen',
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function SourceLine({ sources }: { sources: { chapter: number; page: number }[] }) {
  return <button className="source">Quelle: {sources.map((source, i) => <span key={`${source.chapter}-${source.page}`}>Kap. {source.chapter}, S. {source.page}{i < sources.length - 1 ? ' · ' : ''}</span>)} ↗</button>
}

export default function App() {
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [scope, setScope] = useState('Kap. 1–18')
  const [intent, setIntent] = useState('Ich stecke fest')
  const [editingAssumption, setEditingAssumption] = useState(false)
  const [assumptionText, setAssumptionText] = useState(assumption)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [volume, setVolume] = useState('leise')
  const [selectedLens, setSelectedLens] = useState('neutral')
  const [selectedClue, setSelectedClue] = useState<number | null>(null)
  const [branchSaved, setBranchSaved] = useState(false)
  const [page, setPage] = useState<Page>('schreibraum')

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        const states: PanelState[] = ['input', 'loading', 'result', 'empty', 'boundary', 'clues']
        setPanel(current => states[(states.indexOf(current ?? 'input') + 1) % states.length])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (panel !== 'loading') return
    const timeout = window.setTimeout(() => setPanel('result'), 2100)
    return () => window.clearTimeout(timeout)
  }, [panel])

  const openPanel = () => { setPanel('input'); setFeedback(null) }
  const act = (message: string, action: string) => setFeedback({ message, action })
  const undo = () => { setFeedback(null); setBranchSaved(false) }
  const exploreBranch = (branch: Branch) => {
    if (branch.id === 'brother') { setPanel('clues'); setFeedback(null) }
    else act(`„${branch.title}“ bleibt als Möglichkeit sichtbar.`, 'Gemerkte Möglichkeit')
  }

  if (page === 'fundgrube') {
    return <Fundgrube volume={volume} setVolume={setVolume} onWritingRoom={() => setPage('schreibraum')} />
  }

  return (
    <main className={`app ${panel ? 'panel-open' : ''}`}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">A</span><span>authoria</span></div>
        <div className="project-title"><span>Der Sommer der Könige</span><ChevronDown size={15} /></div>
        <nav aria-label="Projektbereiche"><button className="nav-link current">Schreibraum</button><button className="nav-link" onClick={() => { setPanel(null); setPage('fundgrube') }}>Fundgrube <span className="new-dot">3</span></button><button className="nav-link">Versionen & Zweige</button></nav>
        <div className="top-actions"><label className="volume"><Sparkles size={15} /><span>KI:</span><select value={volume} onChange={e => setVolume(e.target.value)} aria-label="KI-Lautstärke"><option>still</option><option>leise</option><option>gesprächig</option></select></label><button className="avatar" aria-label="Profil von Lena">LW</button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title"><span>MANUSKRIPT</span><button aria-label="Kapitel hinzufügen"><Plus size={17} /></button></div>
          <div className="book-title"><FileText size={16} /> Der Sommer der Könige</div>
          <div className="chapter-list">{chapters.map(chapter => <button key={chapter.number} className={`chapter ${chapter.active ? 'selected' : ''}`}><span>Kap. {chapter.number}</span><span>{chapter.title}</span><small>S. {chapter.page}</small></button>)}</div>
          <div className="sidebar-bottom"><button><Search size={16} />Durchsuchen</button><button><CircleHelp size={16} />Hilfe & Feedback</button></div>
        </aside>

        <section className="editor" aria-label="Manuskript">
          <div className="editor-meta"><span>Kapitel {manuscript.chapter}</span><span>·</span><span>Seite {manuscript.page}</span><span className="saved">Gespeichert</span></div>
          <article className="manuscript">
            <h1>{manuscript.title}</h1>
            {manuscript.paragraphs.map((paragraph, index) => <p key={paragraph} className={index === 2 ? 'highlighted' : ''}>{paragraph}</p>)}
            <div className="selection-actions"><span>Markierte Stelle</span><button onClick={openPanel}><Sparkles size={15} />Innehalten zu dieser Stelle</button></div>
          </article>
          {branchSaved && <div className="branch-note"><span className="check">✓</span> Gespeichert im Zweig <strong>„Bruder“</strong> · Original bleibt</div>}
          <button className="pause-button" onClick={openPanel}><span className="pause-icon">Ⅱ</span> Innehalten</button>
        </section>

        {panel && <aside className="ai-panel" aria-label="Innehalten-Panel">
          <div className="panel-header"><div><div className="eyebrow ai-label"><Sparkles size={13} /> KI-IMPULS</div><h2>{panel === 'clues' ? 'Spuren legen' : 'Innehalten'} <span>· Kap. 18</span></h2></div><button className="icon-button" onClick={() => setPanel(null)} aria-label="Panel schließen"><X size={20} /></button></div>
          {panel !== 'clues' && <div className="panel-context">Bezieht sich auf <strong>{scope}</strong></div>}
          {panel === 'input' && <InputPanel scope={scope} setScope={setScope} intent={intent} setIntent={setIntent} editing={editingAssumption} setEditing={setEditingAssumption} assumptionText={assumptionText} setAssumptionText={setAssumptionText} onStart={() => setPanel('loading')} onBoundary={() => setPanel('boundary')} />}
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

function Fundgrube({ volume, setVolume, onWritingRoom }: { volume: string; setVolume: (value: string) => void; onWritingRoom: () => void }) {
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
      <div className="project-title"><span>Der Sommer der Könige</span><ChevronDown size={15} /></div>
      <nav aria-label="Projektbereiche"><button className="nav-link" onClick={onWritingRoom}>Schreibraum</button><button className="nav-link current">Fundgrube {newCount > 0 && <span className="new-dot">{newCount}</span>}</button><button className="nav-link">Versionen & Zweige</button></nav>
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

function InputPanel(props: { scope: string; setScope: (value: string) => void; intent: string; setIntent: (value: string) => void; editing: boolean; setEditing: (value: boolean) => void; assumptionText: string; setAssumptionText: (value: string) => void; onStart: () => void; onBoundary: () => void }) {
  return <div className="panel-content input-panel"><div className="selected-text"><span>MARKIERTE STELLE</span><p>„{manuscript.selection}“</p></div><section><h3>Wobei soll ich schauen?</h3><div className="chips">{['Kap. 1–18', 'nur dieses Kapitel', 'nur Figur: Mira'].map(value => <Chip key={value} active={props.scope === value} onClick={() => props.setScope(value)}>{value}</Chip>)}</div></section><section><h3>Was brauchst du gerade?</h3><div className="chips">{['Ich stecke fest', 'Was habe ich vergessen?', 'Perspektive wechseln'].map(value => <Chip key={value} active={props.intent === value} onClick={() => props.setIntent(value)}>{value}</Chip>)}</div></section><section className="assumption"><div className="assumption-title"><span>Ich verstehe …</span><button onClick={() => props.setEditing(!props.editing)}>{props.editing ? 'Fertig' : 'Ändern'}</button></div>{props.editing ? <textarea value={props.assumptionText} onChange={event => props.setAssumptionText(event.target.value)} /> : <p>{props.assumptionText}</p>}</section><label className="optional-question">Eigene Frage stellen …<input placeholder="Optional" onChange={event => { if (event.target.value.toLowerCase().includes('schreib')) props.onBoundary() }} /></label><button className="primary-button" onClick={props.onStart}><Sparkles size={17} />Innehalten</button></div>
}

function LoadingPanel({ onCancel }: { onCancel: () => void }) { return <div className="panel-content loading"><div className="loading-orbit"><span></span><Sparkles size={23} /></div><h3>Ich sehe mir deine Spuren an</h3><p>Ich prüfe nur den gewählten Bereich und ändere nichts an deinem Text.</p><ul>{loadingSteps.map((step, index) => <li key={step} className={index < 2 ? 'done' : 'working'}><span>{index < 2 ? '✓' : '…'}</span>{step}</li>)}</ul><button className="secondary-button" onClick={onCancel}>Abbrechen</button></div> }

function ResultPanel({ lens, setLens, branches: shownBranches, onExplore, onAction, onAlternatives }: { lens: string; setLens: (value: string) => void; branches: Branch[]; onExplore: (branch: Branch) => void; onAction: (message: string, action: string) => void; onAlternatives: () => void }) { return <div className="panel-content result"><section><div className="section-title"><h3>Fundstücke</h3><span className="count">{findings.length}</span></div>{findings.map(finding => <article className="finding" key={finding.title}><span>{finding.label}</span><h4>{finding.title}</h4><p>{finding.text}</p><SourceLine sources={finding.sources} /></article>)}</section><section><div className="section-title"><h3>Fragen an dich</h3></div><ol className="questions">{questions.map(question => <li key={question}><button onClick={() => onAction('Als private Notiz gesichert. Dein Manuskript bleibt unverändert.', 'Notiz übernommen')}>{question}</button></li>)}</ol></section><section><div className="section-title"><h3>Was wäre wenn …</h3><span className="ai-tag">KI</span></div><div className="branch-list">{shownBranches.map(branch => <article className="branch-card" key={branch.id}><h4>{branch.title}</h4><p>{branch.description}</p><small>{branch.source}</small><div className="branch-actions"><button className="branch-primary" onClick={() => onExplore(branch)}>Spuren suchen</button><button onClick={() => onAction(`„${branch.title}“ wurde als Notiz abgelegt.`, 'Notiz übernommen')}>Notiz</button><button onClick={() => onAction(`„${branch.title}“ wurde für später vorgemerkt.`, 'Für später vorgemerkt')}><Clock3 size={14} /></button><button onClick={() => onAction(`„${branch.title}“ wird nicht mehr angezeigt.`, 'Verworfen')}>Verwerfen</button></div></article>)}</div><button className="text-button" onClick={onAlternatives}>Andere Zweige zeigen <ArrowLeft className="arrow-right" size={15} /></button></section><section className="lens"><h3>Linse</h3><div className="chips">{['neutral', 'aus Miras Sicht', 'aus Teos Sicht'].map(value => <Chip key={value} active={lens === value} onClick={() => setLens(value)}>{value}</Chip>)}</div></section></div> }

function EmptyPanel({ onClose, onExpand }: { onClose: () => void; onExpand: () => void }) { return <div className="panel-content empty-state"><div className="empty-icon"><Search size={25} /></div><h3>Hier finde ich keinen offenen Faden.</h3><p>Möchtest du den Bereich erweitern?</p><button className="primary-button" onClick={onExpand}>Ganzes Manuskript prüfen</button><button className="text-button" onClick={onClose}>Schließen</button></div> }

function BoundaryPanel({ onQuestions, onPerspective }: { onQuestions: () => void; onPerspective: () => void }) { return <div className="panel-content boundary"><div className="request-bubble"><span>LENA</span><p>„Schreib mir die Szene.“</p></div><div className="boundary-answer"><Sparkles size={18} /><p>Ich schreibe keine Prosa, damit es deine Geschichte bleibt. Ich kann dir Fragen stellen oder die Szene aus einer anderen Perspektive betrachten.</p></div><button className="primary-button" onClick={onQuestions}>Fragen stellen</button><button className="secondary-button" onClick={onPerspective}>Perspektive wechseln</button></div> }

function CluesPanel({ selected, setSelected, onSave }: { selected: number | null; setSelected: (value: number | null) => void; onSave: () => void }) { return <div className="panel-content clues"><div className="clue-intro"><span className="ai-label"><Sparkles size={13} /> KI-IMPULS</span><h3>Ein Bruder existiert</h3><p>Diese fünf Stellen könnten Platz für einen Hinweis bieten. Du entscheidest, ob und was du dort selbst schreibst.</p></div><div className="progress"><span>Spuren prüfen</span><strong>{selected === null ? 0 : selected + 1} / 5</strong><div><i style={{ width: `${selected === null ? 0 : ((selected + 1) / 5) * 100}%` }} /></div></div><div className="clue-list">{clues.map((clue, index) => <article key={clue.chapter} className={`clue ${selected === index ? 'chosen' : ''}`}><button className="clue-toggle" onClick={() => setSelected(selected === index ? null : index)}><span><b>Kap. {clue.chapter}</b> · S. {clue.page}</span><ChevronDown size={16} /></button><p>„{clue.excerpt}“</p><div className="why"><Lightbulb size={15} /><span><b>Warum hier?</b>{clue.reason}</span></div><div className="clue-actions"><button onClick={() => setSelected(index)}>Zur Stelle springen</button><button>Auslassen</button></div></article>)}</div><button className="primary-button" onClick={onSave}>Zweig „Bruder“ sichern</button></div> }
