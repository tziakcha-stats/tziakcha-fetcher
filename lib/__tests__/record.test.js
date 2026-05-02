const zlib = require("zlib");
const api = require("../index");
const recordApi = require("../record");
const packageJson = require("../../package.json");
const nodeFetchApi = require("../record/fetch-node");
const browserFetchApi = require("../record/fetch-browser");

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
  it("keeps record exports browser-safe", () => {
    expect(recordApi.decodeAction).toEqual(expect.any(Function));
    expect(recordApi.decompress).toEqual(expect.any(Function));
    expect(recordApi.extractWins).toEqual(expect.any(Function));
    expect(recordApi.fetch).toEqual(expect.any(Function));
    expect(recordApi.fetchStep).toEqual(expect.any(Function));
    expect(recordApi.parseWinFanItems).toEqual(expect.any(Function));
    expect(recordApi.simulate).toEqual(expect.any(Function));
    expect(recordApi.analyze).toBeUndefined();
  });

  it("decompresses zlib base64 encoded step JSON", async () => {
    const step = { p: [{ n: "A" }], b: 1 };

    await expect(decompressZlibBase64(encodeStep(step))).resolves.toBe(
      JSON.stringify(step)
    );
    await expect(
      nodeFetchApi.decompressZlibBase64(encodeStep(step))
    ).resolves.toBe(JSON.stringify(step));
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

  it("keeps default record fetch aligned with node runtime implementation", () => {
    expect(fetchTziakchaRecord).toBe(nodeFetchApi.fetchTziakchaRecord);
    expect(fetchTziakchaRecordStep).toBe(nodeFetchApi.fetchTziakchaRecordStep);
    expect(decompressZlibBase64).toBe(nodeFetchApi.decompressZlibBase64);
  });

  it("passes through decoded steps in both runtime fetch implementations", async () => {
    const step = { p: [{ n: "A" }], a: [], b: 0 };
    const fetch = jest.fn().mockResolvedValue(
      createJsonResponse({
        id: "rec1",
        belongs: "sess1",
        script: "<Decoded>",
        step
      })
    );

    await expect(
      nodeFetchApi.fetchTziakchaRecord("rec1", { fetch })
    ).resolves.toEqual({
      id: "rec1",
      belongs: "sess1",
      script: "<Decoded>",
      step,
      raw: expect.objectContaining({ id: "rec1", script: "<Decoded>", step })
    });
    await expect(
      browserFetchApi.fetchTziakchaRecord("rec1", { fetch })
    ).resolves.toEqual({
      id: "rec1",
      belongs: "sess1",
      script: "<Decoded>",
      step,
      raw: expect.objectContaining({ id: "rec1", script: "<Decoded>", step })
    });
  });

  it("uses decompress override consistently in both runtime fetch implementations", async () => {
    const step = { p: [{ n: "B" }], a: [{ t: "noop" }], b: 1 };
    const fetch = jest
      .fn()
      .mockResolvedValue(createJsonResponse({ id: "rec2", script: "ignored" }));
    const decompressOverride = jest
      .fn()
      .mockResolvedValue(JSON.stringify(step));

    await expect(
      nodeFetchApi.fetchTziakchaRecord("rec2", {
        fetch,
        decompressZlibBase64: decompressOverride
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: "rec2",
        script: "<Decoded>",
        step
      })
    );
    await expect(
      browserFetchApi.fetchTziakchaRecord("rec2", {
        fetch,
        decompressZlibBase64: decompressOverride
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: "rec2",
        script: "<Decoded>",
        step
      })
    );
    expect(decompressOverride).toHaveBeenCalledTimes(2);
    expect(decompressOverride).toHaveBeenNthCalledWith(1, "ignored");
    expect(decompressOverride).toHaveBeenNthCalledWith(2, "ignored");
  });

  it("declares a browser mapping for record fetch runtime split", () => {
    expect(packageJson.browser).toEqual(
      expect.objectContaining({
        "./lib/record/fetch.js": "./lib/record/fetch-browser.js"
      })
    );
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
