// tests/unit/shoutcast.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseShoutcast7HtmlBody, fetchShoutcastStatus } from "@/lib/shoutcast";

describe("parseShoutcast7HtmlBody", () => {
  it("extracts basic data from a 7.html response", () => {
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

  it("preserves commas in the track name", () => {
    const body =
      "<html><body>1234,1,500,200,150,128,Bowie - Suffragette City, oh my</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toContain("Suffragette City");
    expect(result?.song).toContain("oh my");
  });

  it("returns null on empty body", () => {
    expect(parseShoutcast7HtmlBody("")).toBeNull();
  });

  it("strips HTML tags from track name", () => {
    const body = "<html><body>1,1,1,1,1,128,Artist - Song</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toBe("Song");
    expect(result?.artist).toBe("Artist");
  });

  it("only splits on the first ' - '", () => {
    const body = "<html><body>1,1,1,1,1,128,Daft Punk - One More Time - Radio Edit</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.artist).toBe("Daft Punk");
    expect(result?.song).toBe("One More Time - Radio Edit");
  });

  it("decodes HTML entities in track name", () => {
    const body = "<html><body>1,1,1,1,1,128,Beyonc&eacute; - Halo</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.artist).toBe("Beyoncé");
  });
});

describe("fetchShoutcastStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null if !response.ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await fetchShoutcastStatus("https://x");
    expect(result).toBeNull();
  });

  it("calls the URL with /7.html and returns parsed result", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "<html><body>1,1,1,1,1,128,Artist - Song</body></html>"
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchShoutcastStatus("https://x");
    expect(fetchMock).toHaveBeenCalledWith("https://x/7.html", expect.any(Object));
    expect(result?.song).toBe("Song");
  });
});
