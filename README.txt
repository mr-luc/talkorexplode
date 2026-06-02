Rette das Gewächshaus – Bio-Kooperationsspiel Klasse 5

WICHTIG: Für das Live-Multiplayer muss die Seite über eine Web-Adresse (https)
geöffnet werden – NICHT als Datei (file://). Als Datei blockieren iPad/iPhone das
Nachladen der Verbindungs-Bibliothek, und der QR-Code zeigt auf einen lokalen
Dateipfad, den das andere Gerät nicht öffnen kann.

Das Live-Sync läuft über PartyKit (ein kleiner WebSocket-Server auf Cloudflare).
Das funktioniert auch in strengen Schul-WLANs (kein WebRTC).

Schritt A – Seite hosten (Cloudflare Pages, kostenlos):
1. Cloudflare-Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
2. Repo "talkorexplode" auswählen.
3. Framework preset: None. Build command: leer. Build output directory: /
4. Save and Deploy. Es entsteht eine URL wie https://talkorexplode.pages.dev

Schritt B – PartyKit-Sync-Server einmalig veröffentlichen:
Voraussetzung: Node.js auf dem Computer installiert.
1. Repo lokal öffnen (Terminal im Projektordner).
2. Einmalig:  npm install
3. Veröffentlichen:  npm run deploy
   (entspricht "npx partykit deploy"; beim ersten Mal mit GitHub anmelden).
4. Am Ende zeigt die Konsole die Adresse, z.B.:
      talkorexplode.DEIN-USERNAME.partykit.dev
5. Diese Adresse in index.html oben eintragen:
      const PARTYKIT_HOST='talkorexplode.DEIN-USERNAME.partykit.dev';
   speichern, committen, pushen -> Cloudflare Pages deployt automatisch neu.

Hinweis: Schritt B nur einmal nötig. Solange PARTYKIT_HOST noch "DEIN-USERNAME"
enthält, zeigt das Spiel den Hinweis "PartyKit noch nicht eingerichtet".

Spielablauf (beide Geräte öffnen die Cloudflare-Pages-Adresse, brauchen Internet):
1. iPad wählt „Gewächshaus hosten“ und zeigt einen Raumcode + QR-Code.
2. iPhone scannt den QR-Code (oder „Als Forscher beitreten“ + Raumcode eingeben).
3. Das iPhone sieht die Anleitung und live Timer, gelöste Aufgaben und Fehler – aber NICHT das Gewächshaus.
4. Die Gewächshaus-Person darf die Anleitung nicht sehen.
5. Sensorwerte und Geräte werden absichtlich nicht synchronisiert: darüber muss gesprochen werden.

Ohne Internet / ohne Hosting: „Anleitung offline öffnen“ zeigt die Anleitung
ohne Live-Stand. Dann werden alle Werte nur mündlich durchgegeben.

Unterrichtsidee:
- Thema: Kommunikation, biologische Grundbegriffe, einfache Algorithmen
- Dauer: 15–25 Minuten
- Nachbesprechung: Was war eindeutig? Was war missverständlich? Welche Regel war ein Algorithmus?

Module:
1. Bewässerungs-Schläuche: Regeln lesen und anwenden
2. Tiergruppe: Reptilien erkennen
3. Pflanzen-Code: Fotosynthese-Grundidee

Anpassen:
Die Fragen und Regeln stehen direkt in der index.html und können in Textastic oder VS Code geändert werden.
