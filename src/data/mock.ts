export type Source = { chapter: number; page: number }

export const chapters = [
  { number: 2, title: 'Zwei Brüder im Schnee', page: 31 },
  { number: 15, title: 'Der rote Schwur', page: 249 },
  { number: 16, title: 'Unter den Zinnen', page: 267 },
  { number: 17, title: 'Das letzte Gelöbnis', page: 286 },
  { number: 18, title: 'Die leere Krone', page: 301, active: true },
]

export const manuscript = {
  title: 'Die leere Krone',
  chapter: 18,
  page: 302,
  paragraphs: [
    'Der Morgen hatte keine Farbe. Über den Dächern von Arven lag ein stiller Nebel, und selbst die Glocken schienen den Atem anzuhalten. Teo stand am Fenster des Turmzimmers und zählte die Fahnen im Hof, bis er begriff, dass eine von ihnen auf halbmast hing.',
    'Mira sagte nichts, als die Wachen den Königssaal öffneten. Ihre Hand ruhte auf dem kalten Stein der Fensterbank. Hinter den hohen Türen warteten der Rat, die Gesandten und das Volk auf ein Zeichen, das niemand geben konnte.',
    'Der König war in der Nacht gestorben. Prinz Edrik war seit Jahren tot. Und nun lag die Krone auf dem dunklen Samt, zu groß für jedes der Gesichter im Raum.',
    'Teo trat einen Schritt näher. „Wer spricht jetzt für Arven?“, fragte er. Mira wandte sich nicht um. Im Hof schlug der Wind gegen die Fahnen, als wollte er eine Antwort aus ihnen reißen.',
  ],
  selection: 'Der König war in der Nacht gestorben. Prinz Edrik war seit Jahren tot. Und nun lag die Krone auf dem dunklen Samt, zu groß für jedes der Gesichter im Raum.',
}

export const chapterManuscripts: Record<number, { title: string; page: number; paragraphs: string[] }> = {
  2: {
    title: 'Zwei Brüder im Schnee',
    page: 31,
    paragraphs: [
      'Im Stall roch es nach Heu und kaltem Eisen. Der junge Edrik wollte sein Pferd selbst satteln, wie jeden Morgen.',
      'Der Stallmeister senkte den Blick, als Edriks Name fiel. Draußen begann es zu schneien.',
    ],
  },
  15: {
    title: 'Der rote Schwur',
    page: 249,
    paragraphs: [
      'Der Regen hatte die Fahnen über dem Hof schwer gemacht. Teo kniete auf den nassen Steinen der Kapelle, das Schwert quer über den Knien, und sprach die alten Worte, die sein Vater vor ihm gesprochen hatte.',
      '„Ich schütze das Blut des Königs“, sagte er, „solange es fließt.“',
      'Mira stand im Schatten der Säulen. Als er aufsah, begegneten sich ihre Blicke, und er bemerkte zum ersten Mal, wie grün ihre Augen im Kerzenlicht waren. Sie wandte sich ab, bevor er etwas sagen konnte.',
      'Später würde er sich fragen, warum sie bei dem Wort „Blut“ so still geworden war.',
    ],
  },
  16: {
    title: 'Unter den Zinnen',
    page: 267,
    paragraphs: [
      'Vom Turmzimmer aus sah man über die ganze Stadt, bis zu den Hügeln, hinter denen Velmor lag. Teo kam oft hierher, wenn der Palast zu laut wurde.',
      'An diesem Abend fand er auf dem Fenstersims einen versiegelten Brief. Das Wachs trug kein Wappen, das er kannte, nur einen zweiten, kleineren Abdruck neben dem königlichen: das andere Siegel, von dem die Gesandten gesprochen hatten.',
      'Er drehte den Brief lange in den Händen. Dann legte er ihn zurück, genau so, wie er ihn gefunden hatte.',
      'Unten im Hof lachte jemand. Es klang fremd in dieser Nacht.',
    ],
  },
  17: {
    title: 'Das letzte Gelöbnis',
    page: 286,
    paragraphs: [
      'Der König ließ den Rat in den Königssaal rufen, obwohl er kaum noch stehen konnte. Mira stützte ihn, als er die Stufen zum Thron hinaufging.',
      '„Ich gelobe“, sagte er, „dass Arven nicht ohne Erben bleiben wird.“',
      'Niemand wagte zu fragen, wen er meinte. Prinz Edrik lag seit Jahren unter dem Stein im Nordhof, und alle im Saal wussten es.',
      'Am Ende der Halle wartete ein Gesandter aus Velmor. Er verneigte sich tief, doch sein Blick blieb auf Mira gerichtet, als kenne er sie von früher.',
    ],
  },
  18: { title: manuscript.title, page: manuscript.page, paragraphs: manuscript.paragraphs },
}

export const assumption = 'Dir fehlt ein Thronfolger, weil Prinz Edrik in Kap. 4 gestorben ist.'

export const findings = [
  {
    label: 'Offener Faden',
    title: 'Thronfolge',
    text: 'Prinz Edrik stirbt in Kap. 4, danach wird kein Erbe genannt.',
    sources: [{ chapter: 4, page: 61 }, { chapter: 18, page: 302 }] satisfies Source[],
  },
  {
    title: '„Das andere Siegel“',
    label: 'Offener Faden',
    text: 'Ein Faden aus Kap. 11 taucht zuletzt in Kap. 16 wieder auf.',
    sources: [{ chapter: 11, page: 190 }, { chapter: 16, page: 270 }] satisfies Source[],
  },
]

export const questions = [
  'Was weiß Mira über die Thronfolge, das Teo nicht weiß?',
  'Wer würde von einer leeren Krone profitieren?',
  'Welche frühere Entscheidung könnte jetzt eine neue Bedeutung bekommen?',
]

export type Branch = {
  id: string
  title: string
  description: string
  source: string
}

export const branches: Branch[] = [
  {
    id: 'brother',
    title: 'Ein Bruder existiert',
    description: 'Braucht Hinweise in früheren Kapiteln.',
    source: 'Kap. 2 bietet einen Anknüpfungspunkt.',
  },
  {
    id: 'mira',
    title: 'Mira beansprucht den Thron',
    description: 'Verändert Miras Rolle stark.',
    source: 'Passt zu ihrem Schweigen in Kap. 7.',
  },
  {
    id: 'council',
    title: 'Der Rat regiert',
    description: 'Öffnet einen politischen Konflikt.',
    source: 'Dafür wären neue Figuren nötig.',
  },
]

export const alternativeBranches: Branch[] = [
  { id: 'archive', title: 'Ein altes Gesetz gilt noch', description: 'Macht die Nachfolge zur Auslegungssache.', source: 'Ein Verweis in Kap. 11 könnte tragen.' },
  { id: 'claim', title: 'Eine entfernte Linie meldet Anspruch an', description: 'Bringt eine neue Beziehung nach Arven.', source: 'Miras Reise in Kap. 7 ließe Raum dafür.' },
  { id: 'choice', title: 'Die Krone bleibt bewusst leer', description: 'Verschiebt die Frage auf die Figuren.', source: 'Teos Eid aus Kap. 15 wird dadurch wichtiger.' },
]

export const clues = [
  { chapter: 2, page: 31, excerpt: 'Der Stallmeister senkte den Blick, als Edriks Name fiel.', context: 'Im Stall roch es nach Heu und kaltem Eisen. Der junge Edrik wollte sein Pferd selbst satteln, wie jeden Morgen. Der Stallmeister senkte den Blick, als Edriks Name fiel. Draußen begann es zu schneien.', reason: 'Eine ausweichende Reaktion kann später als Wissen über die Familie lesbar werden.' },
  { chapter: 4, page: 61, excerpt: 'Die Nachricht von Edriks Tod erreichte Arven ohne Siegel.', context: 'Der Bote wartete schweigend im Hof. Die Nachricht von Edriks Tod erreichte Arven ohne Siegel. Niemand fragte, wer sie geschickt hatte.', reason: 'Das fehlende Siegel lässt Raum für eine ungeklärte Geschichte.' },
  { chapter: 7, page: 108, excerpt: 'Mira faltete den Stammbaum, bevor Teo die letzte Zeile sah.', context: 'Das Feuer war fast heruntergebrannt. Mira faltete den Stammbaum, bevor Teo die letzte Zeile sah. Sie sagte, der Staub habe ihr in den Augen gebrannt.', reason: 'Miras Schweigen kann mit der Thronfolge verbunden sein, ohne sie zu erklären.' },
  { chapter: 11, page: 174, excerpt: 'Im Archiv fehlte eine Seite aus dem Register der Könige.', context: 'Zwischen den schweren Bänden lag ein Streifen Pergament. Im Archiv fehlte eine Seite aus dem Register der Könige. Der Bibliothekar sagte, sie sei schon lange verloren.', reason: 'Das fehlende Register kann einen späteren Hinweis glaubwürdig verankern.' },
  { chapter: 15, page: 249, excerpt: 'Der König nannte einen Namen, den niemand im Saal kannte.', context: 'Der Regen drückte gegen die Fenster des Saals. Der König nannte einen Namen, den niemand im Saal kannte. Teo sah, wie Mira die Hände schloss.', reason: 'Der unvollständige Moment schafft einen natürlichen Anknüpfungspunkt.' },
]

export const loadingSteps = [
  'Kap. 1–18 gelesen',
  '14 Figuren, 9 Fäden gefunden',
  'Zusammenhänge prüfen',
]

export const fundgrubeFindings = [
  { id: 'brother', type: 'Möglichkeit', title: 'Ein Bruder existiert', source: 'Kap. 2 bietet einen Anknüpfungspunkt.' },
  { id: 'mira', type: 'Möglichkeit', title: 'Mira beansprucht den Thron', source: 'Passt zu ihrem Schweigen in Kap. 7.' },
  { id: 'council', type: 'Möglichkeit', title: 'Der Rat regiert', source: 'Dafür wären neue Figuren nötig.' },
]

export const fundgrubeFigures = [
  { name: 'Teo', role: 'Hauptmann der Wache', mentioned: 'Kap. 3 – 18', tags: ['Mira', 'König'] },
  { name: 'Mira', role: 'Hofdame, Vertraute des Königs', mentioned: 'Kap. 1 – 18', tags: ['Teo', 'König', 'Prinz Edrik'] },
  { name: 'König Aldric', role: 'Herrscher von Arven · † Kap. 18', mentioned: 'Kap. 1 – 18', tags: ['Mira', 'Prinz Edrik'] },
  { name: 'Prinz Edrik', role: 'Thronfolger · † Kap. 4', mentioned: 'Kap. 1 – 4', tags: ['König'] },
]

export const fundgrubePlaces = [
  { name: 'Arven', type: 'Hauptstadt', chapters: 'Kap. 1 – 18' },
  { name: 'Turmzimmer', type: 'Ort von Teo', chapters: 'Kap. 16, 18' },
  { name: 'Königssaal', type: 'Hof', chapters: 'Kap. 2, 17, 18' },
  { name: 'Nordhof', type: 'Hof', chapters: 'Kap. 18' },
]

export const fundgrubeThreads = [
  { id: 'succession', title: 'Thronfolge', source: 'zuletzt Kap. 18, S. 302 ↗', status: 'offen' },
  { id: 'seal', title: 'Das andere Siegel', source: 'zuletzt Kap. 16, S. 270 ↗', status: 'offen' },
  { id: 'oath', title: 'Teos Schwur', source: 'zuletzt Kap. 15, S. 251 ↗', status: 'bewusst offen' },
  { id: 'past', title: 'Miras Vergangenheit', source: 'zuletzt Kap. 7, S. 112 ↗', status: 'bewusst offen' },
  { id: 'wolf', title: 'Der Wolf am Pass', source: 'zuletzt Kap. 3, S. 41 ↗', status: 'loslassen' },
]

export const fundgrubeContradiction = {
  id: 'miras-augen',
  title: 'Miras Augen: in Kap. 3 „grau“, in Kap. 15 „grün“.',
}

export const versionsBranches = [
  { id: 'main', name: 'Hauptlinie', detail: 'Original · zuletzt heute, 20:41' },
  { id: 'brother', name: 'Zweig „Bruder“', detail: 'aus Innehalten · Kap. 18 · aktiv' },
  { id: 'mira-claim', name: 'Zweig „Mira beansprucht den Thron“', detail: 'als Notiz geparkt' },
]

export const versionHistory = [
  { title: 'Kap. 18 · „Die leere Krone“ weitergeschrieben', detail: 'Heute, 20:41 · Hauptlinie', branch: 'Hauptlinie', tone: 'main' },
  { title: 'Neuer Zweig „Bruder“ aus Innehalten (Kap. 18)', detail: 'Heute, 20:12 · Lena wählt „Ein Bruder existiert“', branch: 'Zweig „Bruder“', tone: 'branch' },
  { title: 'Kap. 2 · Hinweis auf den Bruder geschrieben', detail: 'Heute, 20:18 · +1 Satz · von dir geschrieben', branch: 'Zweig „Bruder“', tone: 'author' },
  { title: 'Kap. 4 · Hinweis am Grab ergänzt', detail: 'Heute, 20:26 · +2 Sätze · von dir geschrieben', branch: 'Zweig „Bruder“', tone: 'author' },
  { title: 'Kap. 17 · „Das letzte Gelöbnis“ überarbeitet', detail: 'Gestern, 22:05 · Hauptlinie', branch: 'Hauptlinie', tone: 'main' },
  { title: 'Kap. 16 · „Unter den Zinnen“ abgeschlossen', detail: 'Mo., 21:30 · Hauptlinie', branch: 'Hauptlinie', tone: 'main' },
]
