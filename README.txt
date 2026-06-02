Rette das Gewächshaus – Bio-Kooperationsspiel Klasse 5

WICHTIG: Für das Live-Multiplayer muss die Seite über eine Web-Adresse (https)
geöffnet werden – NICHT als Datei (file://). Als Datei gibt es keinen Server für
die WebSocket-Verbindung, und der QR-Code zeigt auf einen lokalen Dateipfad, den
das andere Gerät nicht öffnen kann.

Das Live-Sync läuft direkt im Cloudflare-Worker (über ein Durable Object).
Das funktioniert auch in strengen Schul-WLANs (kein WebRTC) und braucht KEINEN
zweiten Dienst: Seite und Sync werden zusammen als ein Worker deployt.

Hosten (Cloudflare Workers, kostenlos, via Git):
1. Cloudflare-Dashboard -> Workers & Pages -> Create -> Workers -> Connect to Git.
2. Repo "talkorexplode" auswählen und verbinden.
3. Cloudflare baut bei jedem Push automatisch (Deploy command: npx wrangler deploy).
4. Es entsteht eine URL wie https://talkorexplode.DEIN-NAME.workers.dev

Mehr ist nicht nötig: Es gibt keinen separaten Sync-Server, keinen Host-Eintrag
und keinen Platzhalter mehr. Das iPhone verbindet sich automatisch zur selben
Adresse, von der die Seite geladen wurde (Pfad /ws).

Optional lokal entwickeln/deployen (Node.js erforderlich):
   npm install
   npm run dev      (lokaler Test mit Worker + Durable Object)
   npm run deploy   (manuelles Deploy via npx wrangler deploy)

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
