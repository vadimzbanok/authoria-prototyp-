# Mein Authoria – Struktur (Tag 2 · Struktur bauen)

> **Startpunkt (aus `recherche.md`):** Lena, eine Discovery Writerin, braucht eine Möglichkeit, in einer Sackgasse die Zusammenhänge ihrer entstehenden Geschichte zu erkennen, weil sie ohne Plan schreibt und Entscheidungen erst später ihre Folgen zeigen. Dabei will sie die volle Autorschaft behalten.
>
> **HMW-Fokus:** Wie könnten wir Pantsern helfen, aus einer Sackgasse zu finden, ohne ihnen den nächsten Schritt vorzugeben?

Beantwortet die drei Fragen der Aufgabe:
1. Welche grundlegenden Seiten gibt es? → **Sitemap**
2. Was passiert auf diesen? → **Seiten-Steckbriefe**
3. Wie hängen diese zusammen? → **User Flow**

---

## 1 · Nutzungsszenarien

### S1 · Sackgasse: der fehlende Erbe — **Kern-Szenario**
- **Kontext:** Kapitel 18. Der König stirbt, aber der Prinz ist schon in Kapitel 4 gestorben.
- **Auslöser:** Es gibt keinen Thronfolger, die Logik bricht.
- **Ablauf:**
  1. Markiert die Stelle, klickt „Innehalten“
  2. Sieht Fundstücke und „Was wäre wenn“-Zweige
  3. Wählt „Ein Bruder existiert“
  4. Sieht frühere Stellen für Hinweise und schreibt sie selbst
- **App tut:** zeigt Zusammenhänge, Zweige und Stellen
- **App tut nicht:** entscheidet nicht, schreibt nicht

### S2 · Wiedereinstieg nach 3 Wochen — Nebenszenario
- **Kontext:** Lena hatte drei Wochen keine Zeit zum Schreiben.
- **Auslöser:** Sie öffnet das Projekt und weiß nicht mehr, wohin die Geschichte wollte.
- **Ablauf:**
  1. Öffnet das Projekt
  2. Sieht „Wo war ich?“: letzte Szene, offene Fäden
  3. Klickt einen offenen Faden an
  4. Springt zur Stelle und schreibt weiter
- **App tut:** fasst zusammen, was sie selbst geschrieben hat
- **App tut nicht:** plant nicht, wie es weitergeht

### S3 · „Schreib mir die Szene“ — Grenzfall
- **Kontext:** Lena ist müde und unter Zeitdruck.
- **Auslöser:** Sie bittet die App, die Szene zu schreiben.
- **Ablauf:**
  1. Tippt die Bitte ins Panel
  2. App erklärt: „Ich schreibe keine Prosa, damit es deine Geschichte bleibt.“
  3. Bietet Fragen oder Perspektivwechsel an
  4. Lena entscheidet selbst
- **App tut:** transparente Grenze, Alternative
- **App tut nicht:** kein versteckter Ghostwriter

**Priorität im Prototyp:** S1 vollständig · S3 als ein Zustand im Panel · S2 optional / als nächster Schritt.

---

## 2 · Gestaltungsprinzipien
Vollständig in `regeln.md`. Kurzfassung:
1. Spiegel statt Autopilot
2. Flow schützen
3. Autorschaft sichtbar
4. Nichts geht verloren
5. Überblick auf Abruf

---

## 3 · Sitemap

```
Projekte (Startseite)
├── Schreibraum
│   ├── Flow-Modus
│   ├── Fundgrube-Seitenleiste      ← KI aktiv
│   ├── Wo war ich?                 ← KI aktiv
│   └── Innehalten-Panel            ← KI aktiv · KERN
│       └── Spuren legen            ← KI aktiv · KERN
├── Fundgrube                       ← KI aktiv
│   ├── Figuren
│   ├── Orte
│   └── Offene Fäden
├── Versionen & Zweige
│   └── Zweig-Vergleich
└── Einstellungen
    ├── KI-Lautstärke
    └── Datenschutz
```

**Benchmark-Entscheidungen:**
- Fundgrube-Seitenleiste: inspiriert vom Novelcrafter-Codex → nachschlagen, ohne den Text zu verlassen (Flow schützen).
- Nur 3 Kategorien in der Fundgrube (Campfire hat ca. 20 Module) → bewusst reduziert, weil Pantser sich sonst verzetteln.
- Keine Planungsansicht (Akte, Kapitel, Szenen im Voraus) → das ist für Plotter, nicht für Lena.

---

## 4 · Seiten-Steckbriefe

| Seite | Zweck | Inhalte | Was Lena tut | Rolle der KI |
|---|---|---|---|---|
| **Projekte** | alle Romane auf einen Blick | Projektliste, zuletzt bearbeitet | Projekt öffnen, neues anlegen | keine |
| **Schreibraum** | Ort zum Schreiben, Herz der App | Manuskript, Kapitelliste, Button „Innehalten“ | schreibt, springt zwischen Kapiteln | still im Hintergrund |
| **Flow-Modus** | ungestört schreiben | nur Text, kleiner Punkt „3 neue Fundstücke“ | schreibt ohne Unterbrechung | automatisieren: sammelt still Figuren, Orte, Fäden |
| **Fundgrube-Seitenleiste** | nachschlagen, ohne den Text zu verlassen | Figuren, Orte, Fäden der aktuellen Szene | aufklappen, Eintrag ansehen, zur Fundgrube wechseln | automatisieren: zeigt nur, was in der Szene vorkommt |
| **Wo war ich?** | Wiedereinstieg nach einer Pause | letzte Szene, offene Fäden, zuletzt erwähnte Figuren | Faden anklicken, zur Stelle springen | automatisieren: fasst nur Lenas eigenen Text zusammen |
| **Innehalten-Panel** | aus der Sackgasse finden | Scope, Fundstücke, 3 Fragen, Was-wäre-wenn-Zweige | Zweig wählen, Frage als Notiz, verwerfen, „Später“ | assistieren: fragt, zeigt Möglichkeiten · **nicht delegieren:** die Entscheidung |
| **Spuren legen** | späte Ideen im früheren Text verankern | frühere Stellen mit „Warum hier?“, Fortschritt | zur Stelle springen, Hinweis selbst schreiben, verwerfen | assistieren: zeigt Stellen · **nicht delegieren:** den Hinweis schreiben |
| **Fundgrube** | Überblick über das Entstandene | Figuren, Orte, offene Fäden, mögliche Widersprüche | durchsuchen, bestätigen, bearbeiten | automatisieren: erkennt und sortiert |
| **Figuren** | alle Figuren im Blick | Name, Rolle, erste/letzte Erwähnung, Beziehungen | bestätigen, bearbeiten, entfernen | automatisieren: erkennt Figuren im Text |
| **Orte** | alle Schauplätze im Blick | Name, Kapitel, zugehörige Figuren | bestätigen, bearbeiten, entfernen | automatisieren: erkennt Orte im Text |
| **Offene Fäden** | nichts vergessen | Handlungsstränge mit Status, zuletzt erwähnt | Status setzen: offen · bewusst offen · loslassen | automatisieren: findet Fäden · **nicht delegieren:** Fäden schließen |
| **Versionen & Zweige** | angstfrei zurückgehen | Hauptlinie, Zweige, Verlauf | Zweig öffnen, zurückkehren, übernehmen | automatisieren: sichert jede Änderung |
| **Zweig-Vergleich** | Varianten nebeneinander sehen | Original und Zweig, Unterschiede markiert | vergleichen, übernehmen oder verwerfen | automatisieren: markiert Unterschiede |
| **Einstellungen** | Kontrolle über die KI | KI-Lautstärke, Rechte der KI, Datenschutz | alles selbst festlegen | keine – hier entscheidet nur Lena |
| **KI-Lautstärke** | bestimmen, wie präsent die KI ist | still · leise (Standard) · gesprächig | Stufe wählen | richtet sich nach Lenas Wahl |
| **Datenschutz** | Sicherheit für das Manuskript | kein Training, Daten bleiben bei Lena | informiert sich | keine |

---

## 5 · User Flow · Szenario S1 „Sackgasse“

| # | Wer | Was passiert | Seite |
|---|---|---|---|
| 1 | Lena | Schreibt Kap. 18 | Schreibraum · Flow-Modus |
| 2 | Lena | Stockt, markiert die Stelle, klickt „Innehalten“ | Schreibraum |
| 3 | App | Zeigt Fundstücke: Figuren, Faden „Thronfolge“ | Innehalten-Panel |
| 4 | App | 3 Fragen + Zweige: Bruder · Mira · Regentschaft | Innehalten-Panel |
| ◆ | Entscheidung | **Passt ein Impuls?** | — |
| 5 | Lena | **ja:** wählt „Ein Bruder existiert“ | Innehalten-Panel |
| 6 | App | Zeigt frühere Stellen mit „Warum hier?“ | Spuren legen |
| 7 | Lena | Springt zu Kap. 2, schreibt den Hinweis selbst | Schreibraum |
| 8 | App | Sichert Zweig „Bruder“, Original bleibt | Versionen & Zweige |
| 9 | Lena | Schreibt weiter, Panel geschlossen | Schreibraum · Flow-Modus |
| alt | Lena | **nein:** „Später“ → Fundstücke bleiben in der Fundgrube, zurück zum Text | Fundgrube |

**Seitenweg:** Schreibraum → Innehalten-Panel → Spuren legen → Schreibraum → Versionen & Zweige → Schreibraum

**Bezug zum Schreibzyklus:** Schreiben (1) → Innehalten (2) → Muster erkennen (3–6) → Überarbeiten (7–8) → Weiterschreiben (9)

---

## 6 · Skizzen
- **Idee 1 · Panel rechts:** Text bleibt sichtbar, Panel öffnet sich daneben. ✅ **Gewählt**
- **Idee 2 · Eigener Raum zum Innehalten:** eigener Bildschirm mit Zusammenhängen als Netz.
- **Begründung:** Idee 1 schützt den Flow besser (Prinzip „Flow schützen“), Lena verliert den Text nie aus dem Blick.
