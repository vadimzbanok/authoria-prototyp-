# Master-Prompt · Codex

> **So verwenden:**
> 1. Neuen, leeren Ordner/Repo anlegen, z. B. `authoria-prototyp/`.
> 2. Die 6 Dateien in einen Unterordner `docs/` legen: `00_uebersicht.md`, `aufgabe.md`, `recherche.md`, `regeln.md`, `struktur.md`, `interaktion.md`.
> 3. Die Datei `AGENTS.md` (Teil 1) ins Hauptverzeichnis legen. Codex liest sie automatisch.
> 4. In Codex den Auftrag (Teil 2) einfügen.

---

## Teil 1 · `AGENTS.md` (ins Hauptverzeichnis)

```markdown
# Authoria – Hinweise für Codex

## Projekt
Klickbarer UI-Prototyp für „Authoria“, ein KI-gestütztes Schreibtool für Discovery Writer (Pantser).
Das ist ein Design-Prototyp für eine UX/UI-Präsentation, kein Produkt.

## Kontext lesen
Lies vor jeder Aufgabe alle Dateien in `docs/`, in dieser Reihenfolge:
00_uebersicht.md → aufgabe.md → recherche.md → regeln.md → struktur.md → interaktion.md

## Unverhandelbare Regeln (aus docs/regeln.md)
- Die App erzeugt NIE Prosa, Dialoge oder Beschreibungen für das Manuskript.
- KI-Inhalte sind immer sichtbar markiert (Lila) und verändern das Manuskript nie automatisch.
- Die KI erscheint nur nach Klick auf „Innehalten“.
- Jeder KI-Hinweis zeigt seine Quelle im Text (Kapitel, Seite).

## Technik
- React + Vite + TypeScript + Tailwind CSS.
- Keine echte KI, kein Backend: alle KI-Antworten sind Mock-Daten in `src/data/mock.ts`, Ladezustände mit setTimeout simuliert.
- Alle UI-Texte auf Deutsch.
- Schriften: Literata (Manuskript), Inter (UI) über Google Fonts.
- Farben: Tinte #1E1E1E · Grau #5C5C5C · Linie #E2E2E2 · Grün #3E8E4F (Autorin) · Lila #7B5BD6 und #F1ECFD (nur KI).
- Barrierefreiheit: echte Buttons, Fokus sichtbar, Kontrast ≥ 4.5:1, Ziele ≥ 44 px.

## Arbeitsweise
- Kleine, nachvollziehbare Schritte. Nach jeder Aufgabe kurz zusammenfassen, was geändert wurde.
- Keine Features erfinden, die nicht in docs/ stehen. Bei Unklarheit: nachfragen.
```

---

## Teil 2 · Auftrag für Codex

```
Baue den klickbaren Prototyp für Authoria auf Basis von docs/ und AGENTS.md.

UMFANG (siehe docs/00_uebersicht.md)
- Vollständig: Szenario S1 „Sackgasse: der fehlende Erbe“ (docs/struktur.md, Abschnitt 5 User Flow).
- Als Zustand im Panel: Grenzfall S3 („Ich schreibe keine Prosa …“).
- Nicht bauen: Fundgrube-Vollansicht, Zweig-Vergleich, Projekte-Startseite (nur als Navigationspunkte sichtbar).

SCREENS UND ZUSTÄNDE
1. Schreibraum (Flow-Modus): Kopfzeile, Kapitelliste links, Manuskript Kap. 18 „Die leere Krone“ in der Mitte, markierte Stelle, Button „Innehalten“, Indikator „3 neue Fundstücke“.
2. Innehalten-Panel rechts (Layout „Idee 1 · Panel rechts“ aus docs/struktur.md) mit allen Zuständen aus docs/interaktion.md, Abschnitt 06:
   a) Input (Scope-Chips, Absicht-Chips, „Ich verstehe …“ mit Ändern, optionales Feld)
   b) Lädt (Tasklist, Abbrechen)
   c) Ergebnis (Fundstücke mit Quelle, 3 Fragen, 3 Zweig-Karten mit Aktionen, Linse)
   d) Nichts gefunden
   e) Grenzfall S3
3. Spuren legen: 5 Stellen mit Ausschnitt, „Warum hier?“, Aktionen; Seitenleiste mit Zweig „Bruder“ und Fortschritt.
4. Zurück im Schreibraum: Hinweis „Gespeichert im Zweig „Bruder“ · Original bleibt“.

INTERAKTIONEN (docs/interaktion.md, Abschnitt 05)
- Chips umschaltbar, „Ändern“ macht die Annahme editierbar.
- Zweig-Karten: Spuren suchen · Als Notiz übernehmen · Verwerfen · Später (mit sichtbarer Rückmeldung).
- „Andere Zweige zeigen“ lädt 3 alternative Mock-Zweige.
- ↶ Rückgängig für die letzte Aktion im Panel.
- KI-Lautstärke in der Kopfzeile: Still · Leise · Gesprächig.
- Ein versteckter Demo-Schalter (z. B. Taste „D“) wechselt zwischen den Panel-Zuständen für die Präsentation.

MOCK-DATEN
Lege alle Inhalte in src/data/mock.ts an: Kapitel, Manuskripttext Kap. 18 (3–4 Absätze, eigener Text), Fundstücke, Fragen, Zweige, die 5 Spuren-Stellen (Kap. 2, 4, 7, 11, 15). Inhalte aus docs/interaktion.md übernehmen.

ABNAHMEKRITERIEN
- Der komplette Flow S1 ist ohne Fehler durchklickbar.
- An keiner Stelle wird Text ins Manuskript eingefügt.
- Jeder KI-Hinweis zeigt Kapitel und Seite.
- Lila wird ausschließlich für KI-Elemente verwendet.
- `npm run dev` startet den Prototyp.

Beginne mit einem kurzen Plan (Komponenten, Dateien), warte auf mein OK, dann baue Schritt für Schritt.
```
