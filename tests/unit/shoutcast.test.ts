// tests/unit/shoutcast.test.ts
import { describe, it, expect } from "vitest";
import { parseShoutcast7HtmlBody } from "@/lib/shoutcast";

describe("parseShoutcast7HtmlBody", () => {
  it("extrait les données de base d'une réponse 7.html", () => {
    const body =
      "<html><body>1234,1,500,200,150,128,Beyoncé - Halo</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result).toEqual({
      streamingId: "1234",
      listenersMax: 500,
      listenersPeak: 200,
      listeners: 150,
      bitrate: 128,
      song: "Halo",
      artist: "Beyoncé"
    });
  });

  it("conserve les virgules dans le nom du morceau", () => {
    const body =
      "<html><body>1234,1,500,200,150,128,Bowie - Suffragette City, oh my</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toContain("Suffragette City");
    expect(result?.song).toContain("oh my");
  });

  it("retourne null sur body vide", () => {
    expect(parseShoutcast7HtmlBody("")).toBeNull();
  });

  it("retire les balises HTML du nom du morceau", () => {
    const body = "<html><body>1,1,1,1,1,128,Artist - Song</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toBe("Song");
    expect(result?.artist).toBe("Artist");
  });
});
