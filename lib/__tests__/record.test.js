const zlib = require("zlib");
const api = require("../index");

const {
  decompress: decompressZlibBase64,
  fetch: fetchTziakchaRecord,
  fetchStep: fetchTziakchaRecordStep
} = api.record;

function encodeStep(step) {
  return zlib.deflateSync(Buffer.from(JSON.stringify(step))).toString("base64");
}

function createJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body)
  };
}

describe("record fetching", () => {
  it("decompresses zlib base64 encoded step JSON", async () => {
    const step = { p: [{ n: "A" }], b: 1 };

    await expect(decompressZlibBase64(encodeStep(step))).resolves.toBe(
      JSON.stringify(step)
    );
  });

  it("fetches a record and decodes script into step", async () => {
    const step = { p: [{ n: "A" }], a: [], b: 0 };
    const fetch = jest.fn().mockResolvedValue(
      createJsonResponse({
        id: "rec1",
        belongs: "sess1",
        script: encodeStep(step)
      })
    );

    const record = await fetchTziakchaRecord("rec1", {
      fetch,
      baseUrl: "https://example.test"
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://example.test/_qry/record/",
      expect.objectContaining({
        method: "POST",
        body: "id=rec1"
      })
    );
    expect(record).toEqual({
      id: "rec1",
      belongs: "sess1",
      script: "<Decoded>",
      step,
      raw: expect.objectContaining({ id: "rec1" })
    });
  });

  it("returns only step when fetching a record step", async () => {
    const step = { b: 0 };
    const fetch = jest
      .fn()
      .mockResolvedValue(createJsonResponse({ script: encodeStep(step) }));

    await expect(fetchTziakchaRecordStep("rec1", { fetch })).resolves.toEqual(
      step
    );
  });

  it("throws when record script is missing", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValue(createJsonResponse({ id: "rec1" }));

    await expect(fetchTziakchaRecord("rec1", { fetch })).rejects.toThrow(
      "record rec1 缺少 script"
    );
  });
});
