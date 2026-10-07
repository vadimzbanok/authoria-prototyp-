export type Source = { chapter: number; page: number }

export const chapters = [
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

export const assumption = 'Dir fehlt ein Thronfolger, weil Prinz Edrik in Kap. 4 gestorben ist.'

export const findings = [
  {
    label: 'Offener Faden',
    title: 'Thronfolge',
    text: 'Prinz Edrik stirbt, danach wird kein Erbe genannt.',
    sources: [{ chapter: 4, page: 61 }, { chapter: 18, page: 302 }] satisfies Source[],
  },
  {
    label: 'Figur',
    title: 'Mira',
    text: 'Mira vermeidet die Frage nach ihrer Herkunft seit Kap. 7.',
    sources: [{ chapter: 7, page: 108 }] satisfies Source[],
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
  { chapter: 2, page: 31, excerpt: 'Der Stallmeister senkte den Blick, als Edriks Name fiel.', reason: 'Eine ausweichende Reaktion kann später als Wissen über die Familie lesbar werden.' },
  { chapter: 4, page: 61, excerpt: 'Die Nachricht von Edriks Tod erreichte Arven ohne Siegel.', reason: 'Das fehlende Siegel lässt Raum für eine ungeklärte Geschichte.' },
  { chapter: 7, page: 108, excerpt: 'Mira faltete den Stammbaum, bevor Teo die letzte Zeile sah.', reason: 'Miras Schweigen kann mit der Thronfolge verbunden sein, ohne sie zu erklären.' },
  { chapter: 11, page: 174, excerpt: 'Im Archiv fehlte eine Seite aus dem Register der Könige.', reason: 'Das fehlende Register kann einen späteren Hinweis glaubwürdig verankern.' },
  { chapter: 15, page: 249, excerpt: 'Der König nannte einen Namen, den niemand im Saal kannte.', reason: 'Der unvollständige Moment schafft einen natürlichen Anknüpfungspunkt.' },
]

export const loadingSteps = [
  'Kap. 1–18 gelesen',
  '14 Figuren, 9 Fäden gefunden',
  'Zusammenhänge prüfen',
]
