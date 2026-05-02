const zlib = require("zlib");
const api = require("../index");

const { fetchRounds: fetchTziakchaSessionRounds } = api.session;

function encodeStep(step) {
  return zlib.deflateSync(Buffer.from(JSON.stringify(step))).toString("base64");
}

function createJsonResponse(body) {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(body)
  };
}

describe("fetchTziakchaSessionRounds", () => {
  it("fetches a session and all record steps from a URL", async () => {
    const fetch = jest.fn(async url => {
      if (url.includes("/_qry/game/")) {
        return createJsonResponse({
          players: [{ n: "A" }],
          records: [{ i: "rec1" }]
        });
      }

      return createJsonResponse({
        id: "rec1",
        script: encodeStep({ b: 1 })
      });
    });

    const result = await fetchTziakchaSessionRounds(
      "https://tziakcha.net/?id=sess1",
      { fetch }
    );

    expect(result.sessionId).toBe("sess1");
    expect(result.records).toEqual([
      {
        id: "rec1",
        index: 0,
        step: { b: 1 }
      }
    ]);
  });
});
