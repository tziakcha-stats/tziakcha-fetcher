const api = require("../index");

const {
  decodeWallHex,
  tileIdToBase,
  tileIdToGbTile,
  groupHandToGbString
} = api.core.tiles;

describe("tile helpers", () => {
  it("decodes wall hex and formats GB tiles", () => {
    expect(decodeWallHex("00010a")).toEqual([0, 1, 10]);
    expect(tileIdToBase(108)).toBe(27);
    expect(tileIdToGbTile(108)).toBe("E");
    expect(groupHandToGbString([0, 4, 8, 108])).toBe("123mE");
  });

  it("rejects malformed wall hex", () => {
    expect(() => decodeWallHex("0")).toThrow("wall hex 必须是偶数长度字符串");
    expect(() => decodeWallHex("0g")).toThrow("wall hex 包含非法十六进制字符");
  });
});
