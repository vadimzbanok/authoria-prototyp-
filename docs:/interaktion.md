# Mein Authoria – Interaktion + System (Tag 3)

> **Kern-Moment:** das **Innehalten-Panel** in Szenario S1 „Sackgasse: der fehlende Erbe“ (siehe `struktur.md`).
> Lena steckt in Kap. 18 fest: Der König stirbt, der Prinz ist schon tot, es gibt keinen Erben.
>
> Aufgabe: Input · Output · Refinement bedenken und zeigen, wo und wie Lena eingreift und Kontrolle hat.
> Methode: Schichten der KI-Interaktion (Kurs-Tag 10) und Output Patterns (Kurs-Tag 11).

---

## 01 · Intent – Was will Lena eigentlich?
| Intent | Beschreibung | |
|---|---|---|
| Navigieren | etwas Bestimmtes finden | |
| Fokussieren | Antwort auf eine klare Frage | |
| **Explorieren** | weder Ziel noch Input sind klar | ✅ |
| Zusammenfassen | Inhalt verdichten | |

**Entscheidung:** Lena will **explorieren**. Sie sucht Möglichkeiten, keine Antwort. → Kein leeres Prompt-Feld, sondern Impulse und Zweige.

---

## 02 · Scaffolding – Wo erscheint die KI?
**Entscheidung:** Die KI lebt **neben** dem Text, **nie im** Text.
- **Panel rechts** (Innehalten-Panel), öffnet sich nur auf Klick auf „Innehalten“.
- **Kleiner Knopf am markierten Text** („Innehalten zu dieser Stelle“) als Abkürzung.
- **Kein Pop-up**, keine Unterbrechung mitten im Satz.
- **Panel schließen** = sofort zurück im Flow-Modus.

**Warum:** Insight „ungestörter Flow“ · No-go „Kein ständiges Unterbrechen“ · No-go „Keine Prosa schreiben“ · Prinzip „Flow schützen“.

---

## 03 · Input – Wie sagt Lena, was sie braucht?
**Entscheidung:** Kein leeres Prompt-Feld als Einstieg.

| # | Element | Verhalten |
|---|---|---|
| 1 | **Markierte Stelle** | Lena markiert Text → die KI kennt den Kontext automatisch. Lena muss nichts beschreiben. |
| 2 | **Scope-Chips** | `Kap. 1–18` (Standard) · `nur dieses Kapitel` · `nur Figur: Mira`. Sichtbar und änderbar. |
| 3 | **Absicht-Chips** | `Ich stecke fest` · `Was habe ich vergessen?` · `Perspektive wechseln` |
| 4 | **„Ich verstehe …“** | Die KI zeigt ihre Annahme, z. B. „Dir fehlt ein Thronfolger, weil Prinz Edrik in Kap. 4 gestorben ist.“ Link **Ändern**. |
| 5 | **Freies Feld (optional)** | Klein, sekundär: „Eigene Frage stellen …“ |
| – | **Button** | `Innehalten` |

**Prinzip:** Progressive Disclosure – erst das Wesentliche, Extras optional.

**Warum:** Kurs-Tag 10: Die Schwierigkeit, eine vage Not in eine klare Anweisung zu verwandeln, soll beim Produkt liegen, nicht bei der Person · Nicht verstecken, was die KI angenommen hat · Persona: Lena ist misstrauisch → Transparenz.

---

## 04 · Output – Wie antwortet die KI?
**Entscheidung:** Erst zeigen, dann fragen, dann Möglichkeiten öffnen (Reihenfolge 1 → 2 → 3).

| # | Bereich | Inhalt | Pattern |
|---|---|---|---|
| – | **Kopfzeile** | „Innehalten · Kap. 18“ · „bezieht sich auf Kap. 1–18“ | Transparenz |
| 1 | **Fundstücke** | „Offener Faden: Thronfolge – Prinz Edrik stirbt, danach kein Erbe genannt.“ + **Quelle: Kap. 4, S. 61 · Kap. 18, S. 302 ↗** (Klick springt zur Stelle) | Quellen, Drill-down |
| 2 | **Fragen an dich** | „Was weiß Mira über die Thronfolge, das Teo nicht weiß?“ · „Wer würde von einer leeren Krone profitieren?“ (+ 1 weitere) | Impulse statt Antworten |
| 3 | **Was wäre wenn …** | 3 Karten mit möglichen Folgen: **Ein Bruder existiert** (braucht Hinweise in früheren Kapiteln · Kap. 2 bietet einen Anknüpfungspunkt) · **Mira beansprucht den Thron** (verändert Miras Rolle stark · passt zu ihrem Schweigen in Kap. 7) · **Der Rat regiert** (öffnet einen politischen Konflikt · neue Figuren nötig) | Branching |
| 4 | **Linse** | Chips: `neutral` · `aus Miras Sicht` · `aus Teos Sicht` | Style Lens |

**Regel:** Nie Fließtext für das Manuskript, nur Hinweise **über** die Geschichte. Kein Zweig ist „der richtige“.

**Warum:** Kurs-Tag 11: Branching, Style Lenses, Progressive Context · Vertrauen durch Quellen · No-go „Keine erfundenen Fundstellen“ · No-go „Kein Ende und keinen Plan vorgeben“.

---

## 05 · Refinement + Kontrolle – Wie passt Lena an?
**Entscheidung:** Jeder KI-Schritt endet bei einer Entscheidung von Lena.

**An jeder Zweig-Karte:** `Spuren suchen` (primär) · `Als Notiz übernehmen` · `Verwerfen` · `Später`

**Im Panel:**
- `Andere Zweige zeigen` · `Mehr wie diesen` (verfeinern ohne neu zu tippen)
- Scope ändern: `Kap. 1–18` ↔ `nur Kap. 1–10`
- `↶ Rückgängig` · `Panel schließen`
- Hinweis: „Gespeichert im Zweig „Bruder“ · Original bleibt“

| Wann | Was Lena kontrolliert | Schicht |
|---|---|---|
| Bevor die KI startet | Scope und Absicht wählen, Annahme korrigieren | Input |
| Bei jedem Vorschlag | übernehmen als Notiz · verwerfen · später | Output |
| Wenn nichts passt | andere Zweige, „mehr wie diesen“, Scope ändern | Refinement |
| Jederzeit | rückgängig, Panel schließen, KI-Lautstärke | Orchestration |
| Im Manuskript | nur Lena schreibt; jede Änderung lebt in einem Zweig | Autorschaft |

**Warum:** Kurs-Tag 10: Input anpassen, Varianten wählen, neu starten, schließen, entscheiden, ob weiter verfeinert wird · Kurs-Tag 11: Refinement = vom Output zum nächsten Input · Prinzipien „Spiegel statt Autopilot“, „Nichts geht verloren“.

---

## 06 · Zustände + Feedback – Was sieht Lena wann?
| Zustand | Was das Panel zeigt | Aktionen |
|---|---|---|
| **1 · Lädt** | Tasklist: ✓ Kap. 1–18 gelesen · ✓ 14 Figuren, 9 Fäden gefunden · … Zusammenhänge prüfen | `Abbrechen` |
| **2 · Ergebnis** | Fundstücke mit Quelle · 3 Fragen · 3 Zweige | siehe Schritt 05 |
| **3 · Nichts gefunden** | „Ich finde hier keinen offenen Faden. Möchtest du den Bereich erweitern?“ | `Ganzes Manuskript` · `Schließen` |
| **4 · Grenzfall (S3)** | Lena: „Schreib mir die Szene“ → KI: „Ich schreibe keine Prosa, damit es deine Geschichte bleibt. Ich kann dir Fragen stellen oder die Szene aus einer anderen Perspektive betrachten.“ | `Fragen stellen` · `Perspektive wechseln` |

**Warum:** Kurs-Tag 11: Tasklist macht die Arbeit der KI sichtbar · Vertrauen durch Transparenz · Szenario S3: kein versteckter Ghostwriter.

---

## Gesamtbild · Annotierter Kern-Moment
Layout: Kopfzeile (Projekt · Navigation · `KI: leise`) · links Manuskript mit markierter Stelle und Button `Innehalten` · rechts Innehalten-Panel (gestrichelte lila Trennlinie).

| # | Element | Schicht |
|---|---|---|
| 1 | Markierte Stelle | Input: Kontext ohne Tippen |
| 2 | Button „Innehalten“ | Scaffolding: KI nur auf Abruf |
| 3 | Panel rechts | Scaffolding: neben dem Text, nie im Text |
| 4 | Scope „Kap. 1–18“ | Input: sichtbar und änderbar |
| 5 | Absicht-Chips | Input: statt leerem Prompt-Feld |
| 6 | „Ich verstehe …“ | Input: Prompt Expansion, korrigierbar |
| 7 | Fundstück mit Quelle | Output: Vertrauen, Drill-down |
| 8 | Zweig-Karte mit Aktionen | Output: Branching · Kontrolle |
| 9 | Andere Zweige · Rückgängig · Schließen | Refinement + Orchestration |
| 10 | KI-Lautstärke | Kontrolle: wie präsent die KI ist |

**Ergebnis Tag 3:** Innehalten-Panel bis zu Controls, Anzeigen und Feedbacks durchdacht → Grundlage für den Master-Prompt → Tag 4: Gestaltung.
