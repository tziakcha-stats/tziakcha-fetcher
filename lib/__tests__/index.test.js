const api = require("../index");

describe("public api", () => {
  it("exports namespaced record, session and stats apis", () => {
    expect(api.record.simulate).toEqual(expect.any(Function));
    expect(api.record.analyze).toEqual(expect.any(Function));
    expect(api.record.decodeAction).toEqual(expect.any(Function));
    expect(api.session.fetch).toEqual(expect.any(Function));
    expect(api.session.fetchRounds).toEqual(expect.any(Function));
    expect(api.stats.summarizeSession).toEqual(expect.any(Function));
    expect(api.url.parseTziakchaSessionId).toEqual(expect.any(Function));
  });
});
