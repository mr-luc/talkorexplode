// Cloudflare-Worker für "Talk or Explode".
// Liefert die statische Seite aus (über die ASSETS-Bindung) UND betreibt das
// Live-Sync direkt mit – über ein Durable Object pro Raumcode. Dadurch gibt es
// nur EINEN Dienst, der beim Push automatisch deployt: kein zweiter Login,
// kein separater Host, kein Platzhalter in der index.html.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // WebSocket-Verbindung für einen Raum -> an das passende Durable Object.
    if (url.pathname === "/ws") {
      const room = (url.searchParams.get("room") || "").toUpperCase();
      if (!room) return new Response("missing room", { status: 400 });
      const id = env.ROOMS.idFromName("toe-" + room);
      return env.ROOMS.get(id).fetch(request);
    }
    // Alles andere ist die statische Seite (index.html etc.).
    return env.ASSETS.fetch(request);
  },
};

// Ein Raum = ein Durable Object. Reiner Weiterleiter (Relay):
// Das iPad (Host) schickt den Spielstand, das iPhone (Forscher) empfängt ihn.
// Es wird nichts dauerhaft gespeichert – nur der letzte Stand im Speicher,
// damit ein neu beitretendes iPhone sofort etwas sieht.
export class Room {
  constructor(state, env) {
    this.state = state;
    this.sessions = new Set();
    this.last = null; // zuletzt gesehener Spielstand (als JSON-String)
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    server.accept();
    this.sessions.add(server);

    // Neuer Teilnehmer bekommt sofort den letzten bekannten Stand.
    if (this.last) {
      try { server.send(this.last); } catch (e) {}
    }

    server.addEventListener("message", (ev) => {
      const data = typeof ev.data === "string" ? ev.data : "";
      // Nur echte Spielstände merken, nicht das "hello" des Forschers.
      try { if (JSON.parse(data).t !== undefined) this.last = data; } catch (e) {}
      // An alle anderen im selben Raum weiterleiten.
      for (const peer of this.sessions) {
        if (peer !== server && peer.readyState === 1) {
          try { peer.send(data); } catch (e) {}
        }
      }
    });

    const drop = () => this.sessions.delete(server);
    server.addEventListener("close", drop);
    server.addEventListener("error", drop);

    return new Response(null, { status: 101, webSocket: client });
  }
}
