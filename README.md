# Jorge · Garmin Venu X1

Vier eigenständige Connect-IQ-Zifferblätter für Jorge: **Sport, Elegant, Tesla und Portugal**.
Alle vier können nebeneinander installiert werden; jede Variante hat eine eigene App-ID.

**Status: Testversion 0.2.0 kompiliert, noch ohne erfolgreichen Simulator- oder Praxistest dieser Version.** Die Fotos der ersten Version haben Überlappungen und schlechte Schriftglättung gezeigt. Version 0.2.0 verwendet eigene Pixelgrößen für Werte/Labels, antialiasierte Schriften, eine weiße Model-3-Grafik mit Seitenstreifen und Garmin Hold-to-launch für Wetter und Tagesaktivität. Der manuelle Alarm öffnet keinen Wecker.

[Interaktive Browser-Vorschau](https://jorgepnt-design.github.io/Garmin/#studio) · [Vier PRGs als ZIP](https://jorgepnt-design.github.io/Garmin/builds/0.2.0/Jorge-Venu-X1-0.2.0.zip)

Die Browser-Vorschau verwendet dieselben Schriftatlanten, ist aber eine separate Canvas-Implementierung und führt keine PRGs aus. Der offizielle Simulator gehört zum Garmin SDK und wird lokal mit Visual Studio Code/Monkey C gestartet (Strg+F5). In dieser Umgebung startet der Simulator nicht erfolgreich; es gibt deshalb keinen Laufzeitnachweis. Alle vier Builds sind mit SDK 9.3.0 und dem offiziellen venux1-Profil kompiliert.

## Die vier Varianten

| Variante | Gestaltung |
| --- | --- |
| Sport | Schwarz, Neongrün, drei Rundanzeigen |
| Elegant | Schwarz, Champagnergold, feine Trennlinien |
| Tesla | Schwarz, Rot-Weiß, selbst gezeichnete Vektor-Limousine |
| Portugal | Schwarz, Grün-Rot, vereinfachtes Wappenmotiv |

Die Designs sind programmatisch gezeichnet. Die ursprünglichen Bildentwürfe waren Gestaltungsvorschauen;
Schriftarten und Illustrationen sind in dieser ersten Implementierung vereinfacht. Kein Foto und kein offizielles Tesla-Logo.

## Anzeigen und Grenzen

- Digitale Uhrzeit im 24-Stunden-Format mit kleineren Sekunden rechts; Sekunden laufen bei aktivem Display.
- Deutsches Datum mit Wochentag.
- Tatsächlicher Akku der Garmin-Uhr in Prozent.
- Letzte Garmin-Wettertemperatur in °C, nicht die Gehäusetemperatur. Fehlende bzw. mehr als zwei Stunden alte,
  mit Zeitstempel versehene Wetterdaten werden als `--°C` angezeigt.
- Heutige von Garmin ermittelte Tagesdistanz in km, einschließlich Gehen. **Keine ausschließlich aufgezeichneten Laufkilometer.**
- Weckzeit nur als **manueller Anzeigewert**. `MANUELL*` kennzeichnet dies auf dem Zifferblatt.
  Die öffentliche API bietet die Alarmanzahl, aber keine direkt zugängliche Liste mit der nächsten Weckzeit.
  Standard ist `--:--`; keine erfundene oder automatisch synchronisierte Alarmzeit.
  Das Eingeben einer Weckzeit setzt KEINEN Garmin-Wecker.
- Reduzierte Always-on-Ansicht: nur gedimmte Stunden/Minuten, kein Sekundenlauf.
  Leichte Positionsverschiebung pro Minute; AMOLED-Verhalten und Pixelbudget müssen noch am Gerät geprüft werden.
- Kein eigener Wetterdienst, API-Schlüssel oder Standortabruf. Garmin Connect muss die Wetterdaten bereitstellen.

## Bauen auf Windows, macOS oder Linux

1. Java und den offiziellen [Garmin Connect IQ SDK Manager](https://developer.garmin.com/connect-iq/sdk/) installieren.
2. Im SDK Manager ein aktuelles SDK und das **Venu X1**-Geräteprofil installieren.
   Für Geräteprofile kann eine Garmin-Anmeldung erforderlich sein.
3. Python 3.9 oder neuer installieren.
4. Einen privaten Entwickler-Schlüssel mit dem offiziellen Monkey-C-Werkzeug in VS Code erzeugen
   (Befehl **Monkey C: Generate a Developer Key**). Den Schlüssel sicher aufbewahren und nie in GitHub hochladen.
5. Repository herunterladen und im Projektordner ausführen:

```powershell
python tools/validate.py
python tools/build.py --sdk "C:\Garmin\connectiq-sdk" --key "C:\Garmin\developer_key.der"
```

Der SDK-Pfad ist ein Beispiel: den tatsächlichen Ordner verwenden, der den Unterordner `bin` enthält.
Alternativ `CIQ_SDK_HOME` setzen oder `monkeyc` zum PATH hinzufügen.

Optional eine rein manuelle Weckzeit für alle vier Builds:

```powershell
python tools/build.py --sdk "C:\Garmin\connectiq-sdk" --key "C:\Garmin\developer_key.der" --alarm 06:30
```

Das Skript baut nacheinander:

```text
build/Jorge-sport.prg
build/Jorge-elegant.prg
build/Jorge-tesla.prg
build/Jorge-portugal.prg
```

Ein Fehler stoppt den Build. Die PRGs sind erst nach erfolgreichem SDK-Build vorhanden.
Einzelne Variante in VS Code: deren `faces/<variante>`-Ordner als Projekt öffnen.

## Auf die Uhr übertragen

Nach erfolgreichem Build die Venu X1 per USB-Datenkabel mit einem Computer verbinden.
Die vier PRGs in den Ordner `GARMIN/APPS` des Geräts kopieren, sicher trennen und im
Zifferblatt-Menü der Uhr auswählen. Je nach Betriebssystem wird ein MTP-Zugriff benötigt.
Die offizielle Garmin-Anleitung beschreibt dieses Sideloading:
[Your First Connect IQ App](https://developer.garmin.com/connect-iq/connect-iq-basics/your-first-app/).

Ein iPhone kann diese Quellcodedateien oder PRGs nicht einfach als Zifferblatt installieren.
Für die Installation ausschließlich über das iPhone ist eine spätere Veröffentlichung
der kompilierten und geprüften Apps im Connect IQ Store erforderlich; das ist noch nicht erfolgt.
Die Einstellungen in `settings.xml` sind für die spätere Connect-IQ-Verteilung vorbereitet.
Beim Sideloading die manuelle Weckzeit vor dem Build mit `--alarm` festlegen.

## Vor Freigabe prüfen

- SDK-Compiler für alle vier Varianten ohne Fehler ausführen.
- Simulator auf dem Venu-X1-Profil: Layout bei 00:00:00, 11:11:11, 20:35:42 und 23:59:59; keine abgeschnittenen Werte.
- Fehlende Wetterdaten, fehlende Aktivitätsdaten, Akku 100 %, Datum-/Mitternachtswechsel.
- Display aktiv: Sekunden aktualisieren sich; Ruhemodus: reduzierte Anzeige ohne Sekunden.
- Echte Venu X1: Always-on-Pixelbudget, Aufwecken, manuelle Weckzeit, Temperatur, Tagesdistanz und Batterieverbrauch.
- Erst danach PRGs als geprüfte Release-Dateien veröffentlichen.

## Technische Referenzen

- [WatchFace und Aktualisierungsrhythmus](https://developer.garmin.com/connect-iq/api-docs/Toybox/WatchUi/WatchFace.html)
- [Tagesdistanz in Zentimetern](https://developer.garmin.com/connect-iq/api-docs/Toybox/ActivityMonitor/Info.html)
- [Wettertemperatur und Beobachtungszeit](https://developer.garmin.com/connect-iq/api-docs/Toybox/Weather/CurrentConditions.html)
- [Geräteeinstellungen und alarmCount](https://developer.garmin.com/connect-iq/api-docs/Toybox/System/DeviceSettings.html)

Keine Zugangsdaten, privaten Schlüssel oder personenbezogenen Gesundheitsdaten gehören ins Repository.

## Watch Studio Web-App

Die statische Web-App liegt in `docs/`: vier interaktive Zifferblattvorschauen mit Sekunden, Designauswahl, Ruhemodus und Installationsanleitungen für Windows, Mac und iPhone.

Die Seite prüft GitHub-Releases auf passende, nicht leere `Jorge-<variante>.prg`-Assets. Ohne Release-Datei bleibt der Download gesperrt. Ein Release bestätigt keinen Uhrentest. Die Web-App überträgt selbst keine Dateien auf die Uhr.

GitHub Pages: Quelle `main` und Ordner `/docs`. Alternativ kann das Repository mit Vercel verbunden werden; `vercel.json` setzt `docs` als Ausgabeordner.

Web-Tests: `npm install`, danach `npm test`. Geprüft werden Designauswahl, Sekunden/Ruhemodus, Tastaturbedienung der Anleitungen, fehlende Builds, korrekte und ungültige Release-Dateien sowie API-Fehler.
