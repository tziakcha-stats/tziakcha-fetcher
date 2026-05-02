const api = require("../index");

const { fetch: fetchTziakchaSession } = api.session;

function createJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body)
  };
}

describe("fetchTziakchaSession", () => {
  it("fetches and normalizes session players and records", async () => {
    const fetch = jest.fn().mockResolvedValue(
      createJsonResponse({
        players: [
          { n: "A", i: "a-id" },
          { name: "B", id: "b-id" }
        ],
        records: [{ i: "rec1" }, { id: "rec2" }],
        periods: "2"
      })
    );

    const session = await fetchTziakchaSession("sess1", {
      fetch,
      baseUrl: "https://example.test"
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://example.test/_qry/game/?id=sess1",
      expect.objectContaining({
        method: "POST",
        credentials: "include"
      })
    );
    expect(session).toEqual({
      sessionId: "sess1",
      players: [
        { name: "A", id: "a-id" },
        { name: "B", id: "b-id" }
      ],
      records: [
        { id: "rec1", index: 0 },
        { id: "rec2", index: 1 }
      ],
      periods: 2,
      isFinished: true,
      raw: expect.any(Object)
    });
  });

  it("throws useful errors for HTTP failures", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValue(createJsonResponse({}, false, 503));

    await expect(fetchTziakchaSession("sess1", { fetch })).rejects.toThrow(
      "HTTP 503 for /_qry/game/"
    );
  });
});
