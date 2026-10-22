# Jorge · Garmin Venu X1

Vier eigenständige Connect-IQ-Zifferblätter: Sport, Elegant, Tesla und Portugal.

**Version 0.2.1: kompiliert, noch kein erfolgreicher Garmin-Simulator- oder Praxistest dieser Version.**

[Browser-Vorschau](https://jorgepnt-design.github.io/Garmin/#studio) · [Alle vier PRGs als ZIP](https://jorgepnt-design.github.io/Garmin/builds/0.2.1/Jorge-Venu-X1-0.2.1.zip)

Die Schrift ist größer und kräftiger, ohne Schrägstellung oder Serifen. Werte: 32 statt 25 px. Beschriftungen: 18 statt 14 px. Akku: 36 statt 20 px plus Batteriesymbol. Die Hauptziffern sind breiter und 128 statt 122 px hoch. Der weiße Model 3 trägt den schwarzen Seitenstreifen mit roter Unterlinie.

## Daten und Bedienung

- Uhrzeit mit Sekunden im aktiven Display, Datum, Akku, Wettertemperatur und Tagesdistanz.
- Tagesdistanz umfasst Gehen und Laufen, nicht ausschließlich aufgezeichnete Läufe.
- **Garmin-Alarmanzahl:** Die öffentliche Schnittstelle liefert die Anzahl der Alarme, keine nächste Alarmzeit. Die frühere manuelle Ersatz-Uhrzeit wird nicht mehr verwendet. Das Zifferblatt stellt keinen Wecker.
- Echter Wecker: Auf dem Zifferblatt nach links wischen → Uhren → Alarme → Neuer Alarm → Speichern.
- Wetter und Tagesaktivität: Garmin-Gedrückt-halten. Tagesaktivität öffnet die Schritte-Ansicht. Akku-Zielansicht hängt von Garmins Unterstützung ab. Das Alarmfeld öffnet keinen Wecker.
- Browser-Beispielwerte stellen keine Uhrendaten dar. Die Browser-Vorschau benutzt dieselben Schriftatlanten, führt aber keine PRGs aus.

## Installation

Zunächst nur eine PRG aus dem ZIP nach GARMIN/APPS kopieren und die ältere Version derselben Variante ersetzen. Uhr sicher trennen. Nach links wischen → Displaydesign → Design wählen → nach links wischen → Anwenden.

## Bauen und prüfen

Mit lokal installiertem Garmin SDK und Venu-X1-Geräteprofil:

```sh
python3 tools/build.py --sdk /pfad/zum/sdk --key /privater/pfad/developer_key.der
python3 tests/layout.test.py
npm test
```

Die vier Builds wurden mit SDK 9.3.0 und dem offiziellen venux1-Profil erfolgreich kompiliert. Alle Uhrzeiten, lange Datumswerte, 100 % Akku, Temperatur- und Distanzgrenzen werden gegen die tatsächlichen Fontbreiten geprüft. Diese Tests ersetzen keinen Laufzeit- oder visuellen Test auf der Uhr.

Offizieller Garmin-Simulator: Visual Studio Code + Monkey C, Ordner faces/sport (oder andere Variante) öffnen, Strg+F5 und Venu X1 wählen. Der Simulator startet in unserer lokalen Laufzeitumgebung nicht erfolgreich; es gibt keinen Simulatornachweis.

Der private Signierschlüssel bleibt lokal und gehört nicht ins öffentliche Repository.
