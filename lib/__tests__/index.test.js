const api = require("../index");

describe("public api", () => {
  it("exports record simulator and analysis apis", () => {
    expect(api.simulateTziakchaRecord).toEqual(expect.any(Function));
    expect(api.analyzeTziakchaRecord).toEqual(expect.any(Function));
    expect(api.decodeTziakchaAction).toEqual(expect.any(Function));
  });
});
