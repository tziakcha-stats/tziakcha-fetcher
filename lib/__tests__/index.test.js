const api = require("../index");
const nodeApi = require("../node");

describe("public api", () => {
  it("exports browser-safe namespaces from the root entry", () => {
    expect(api.record.simulate).toEqual(expect.any(Function));
    expect(api.record.decodeAction).toEqual(expect.any(Function));
    expect(api.record.analyze).toBeUndefined();
    expect(api.session.fetch).toEqual(expect.any(Function));
    expect(api.session.fetchRounds).toEqual(expect.any(Function));
    expect(api.stats.summarizeSession).toEqual(expect.any(Function));
    expect(api.url.parseTziakchaSessionId).toEqual(expect.any(Function));
  });

  it("exports analyze from the node-only entry", () => {
    expect(nodeApi.analyze).toEqual(expect.any(Function));
  });
});
