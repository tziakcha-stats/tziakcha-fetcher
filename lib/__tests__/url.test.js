const api = require("../index");

const { parseTziakchaSessionId } = api.url;

describe("parseTziakchaSessionId", () => {
  it("returns plain ids unchanged after trimming", () => {
    expect(parseTziakchaSessionId("  TszL5UsT  ")).toBe("TszL5UsT");
  });

  it("extracts id from a tziakcha URL", () => {
    expect(parseTziakchaSessionId("https://tziakcha.net/?id=TszL5UsT")).toBe(
      "TszL5UsT"
    );
  });

  it("returns null for empty input", () => {
    expect(parseTziakchaSessionId("   ")).toBeNull();
  });
});
