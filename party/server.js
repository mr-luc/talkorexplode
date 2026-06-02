// PartyKit-Server für "Talk or Explode".
// Reiner Weiterleiter (Relay): Das iPad (Host) schickt den Spielstand, das iPhone
// (Forscher) empfängt ihn. Pro Raumcode gibt es einen eigenen Raum.
// Es werden keine Daten dauerhaft gespeichert – nur der letzte Stand im Speicher,
// damit ein neu beitretendes iPhone sofort etwas sieht.
export default class GreenhouseServer {
  constructor(room) {
    this.room = room;
    this.last = null; // zuletzt gesehener Spielstand (als JSON-String)
  }

  // Neuer Teilnehmer bekommt sofort den letzten bekannten Stand.
  onConnect(conn) {
    if (this.last) conn.send(this.last);
  }

  // Jede Nachricht an alle anderen im selben Raum weiterleiten.
  onMessage(message, sender) {
    try {
      // Nur echte Spielstände merken, nicht das "hello" des Forschers.
      if (JSON.parse(message).t !== undefined) this.last = message;
    } catch (e) {}
    this.room.broadcast(message, [sender.id]);
  }
}
