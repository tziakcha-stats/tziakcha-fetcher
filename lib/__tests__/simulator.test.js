const api = require("../index");

const { simulate: simulateTziakchaRecord } = api.record;

function createWallHex(overrides = {}) {
  return Array.from({ length: 144 }, (_, index) => {
    const tileId = Object.prototype.hasOwnProperty.call(overrides, index)
      ? overrides[index]
      : index;
    return tileId.toString(16).padStart(2, "0");
  }).join("");
}

describe("simulator parity", () => {
  it("rejects missing step fields", () => {
    expect(() => simulateTziakchaRecord({ id: "missing-step" })).toThrow(
      "record 缺少 step"
    );
    expect(() =>
      simulateTziakchaRecord({ id: "missing-wall", step: { d: 0, a: [] } })
    ).toThrow("step.w 必须是牌墙十六进制字符串");
    expect(() =>
      simulateTziakchaRecord({
        id: "missing-dice",
        step: { w: createWallHex(), a: [] }
      })
    ).toThrow("step.d 必须是数字");
    expect(() =>
      simulateTziakchaRecord({
        id: "missing-actions",
        step: { w: createWallHex(), d: 0 }
      })
    ).toThrow("step.a 必须是动作数组");
  });

  it("captures starting hands on action type 0 and exposes win flags", () => {
    const wall = createWallHex();
    const result = simulateTziakchaRecord({
      id: "rec1",
      step: {
        w: wall,
        d: 0,
        b: 0b00100001,
        a: [[0, 0, 0]]
      }
    });

    expect(result.initialHands[0]).toHaveLength(14);
    expect(result.initialHands[1]).toHaveLength(13);
    expect(result.resultFlags).toEqual({
      winnerMask: 1,
      discarderMask: 2
    });
    expect(result.state.roundWind).toBe("E");
    expect(result.steps[0].action.type).toBe(0);
  });

  it("derives round wind from step.i and consumes wall back on backward draw and flower replacement", () => {
    const wall = createWallHex({
      104: 138
    });
    const result = simulateTziakchaRecord({
      id: "rec2",
      step: {
        w: wall,
        d: 0x1234,
        i: 8,
        a: [
          [7, 0x0105, 100],
          [49, 0x1000 | (2 << 8) | 6, 200]
        ]
      }
    });

    expect(result.roundWind).toBe("W");
    expect(result.state.roundWind).toBe("W");
    expect(result.steps[0].after.wallBackIndex).toBe(142);
    expect(result.steps[1].after.wallBackIndex).toBe(141);
  });

  it("tracks kong discard semantics and preserves processing after zero-fan wins", () => {
    const wall = createWallHex({
      36: 36,
      40: 40,
      41: 41,
      42: 42,
      43: 43,
      52: 40,
      53: 41,
      54: 42,
      55: 43
    });
    const result = simulateTziakchaRecord({
      id: "rec3",
      step: {
        w: wall,
        d: 0,
        a: [
          [2, 36, 100],
          [20, 1098, 200],
          [6, 0, 300],
          [7, 22, 400],
          [21, 3914, 700]
        ]
      }
    });

    expect(result.steps[1].after.players[0].discards).toHaveLength(0);
    expect(result.steps[4].after.players[1].melds).toContainEqual(
      expect.objectContaining({
        type: "gang",
        upgradedFromPeng: true,
        added: true
      })
    );
    expect(result.steps[1].after.lastActionWasKong).toBe(false);
    expect(result.steps[1].after.lastActionWasAddedKong).toBe(false);
    expect(result.steps[3].after.lastActionWasKong).toBe(false);
    expect(result.steps[3].after.lastActionWasAddedKong).toBe(false);
    expect(result.steps[4].after.lastActionWasKong).toBe(true);
    expect(result.steps[4].after.lastActionWasAddedKong).toBe(true);
    expect(result.steps[4].after.lastDiscardTile).toBe(43);
    expect(result.steps[4].after.lastDiscardPlayerIndex).toBe(1);
    expect(result.steps).toHaveLength(5);
    expect(result.steps[3].action.type).toBe(7);
  });

  it("applies draw and discard actions into step snapshots", () => {
    const wall = createWallHex();
    const result = simulateTziakchaRecord({
      id: "rec4",
      step: {
        w: wall,
        d: 0,
        a: [
          [7, 20, 100],
          [2, 20, 200]
        ]
      }
    });

    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].after.players[0].lastDrawTile).toBe(20);
    expect(result.steps[0].after.players[0].handTiles).toContain(20);
    expect(result.steps[1].after.players[0].discards).toContain(20);
    expect(result.steps[1].after.lastDiscardTile).toBe(20);
    expect(result.steps[1].after.lastDiscardPlayerIndex).toBe(0);
  });

  it("applies chi by removing two hand tiles and consuming the offered discard", () => {
    const wall = createWallHex({
      36: 36,
      40: 32,
      41: 41
    });
    const result = simulateTziakchaRecord({
      id: "rec5",
      step: {
        w: wall,
        d: 0,
        a: [
          [2, 36, 100],
          [19, 16393, 200]
        ]
      }
    });

    expect(result.steps[1].after.players[0].discards).toHaveLength(0);
    expect(result.steps[1].after.players[1].melds).toContainEqual(
      expect.objectContaining({
        type: "chi",
        tileIds: [32, 36, 41],
        offeredTileId: 36,
        offerSequence: 1
      })
    );
    expect(result.steps[1].after.players[1].handTiles).not.toContain(32);
    expect(result.steps[1].after.players[1].handTiles).not.toContain(41);
    expect(result.steps[1].after.lastDiscardTile).toBe(36);
    expect(result.steps[1].after.lastDiscardPlayerIndex).toBe(0);
  });

  it("ignores zero-data chi placeholders without mutating discard state", () => {
    const wall = createWallHex();
    const result = simulateTziakchaRecord({
      id: "rec5b",
      step: {
        w: wall,
        d: 0,
        a: [
          [2, 36, 100],
          [19, 0, 200]
        ]
      }
    });

    expect(result.steps[0].after.players[0].discards).toEqual([36]);
    expect(result.steps[1].after.players[0].discards).toEqual([36]);
    expect(result.steps[1].after.players[1].melds).toEqual([]);
    expect(result.steps[1].after.currentPlayerIndex).toBe(1);
  });

  it("applies peng by removing two hand tiles and recording offer metadata", () => {
    const wall = createWallHex({
      36: 37,
      40: 36,
      41: 39
    });
    const result = simulateTziakchaRecord({
      id: "rec6",
      step: {
        w: wall,
        d: 0,
        a: [
          [2, 37, 100],
          [20, 1097, 200]
        ]
      }
    });

    expect(result.steps[1].after.players[0].discards).toHaveLength(0);
    expect(result.steps[1].after.players[1].melds).toContainEqual(
      expect.objectContaining({
        type: "peng",
        tileBase: 36,
        offerDirection: 1,
        offerSequence: 2,
        offeredTileId: 37
      })
    );
    expect(result.steps[1].after.players[1].handTiles).not.toContain(36);
    expect(result.steps[1].after.players[1].handTiles).not.toContain(39);
  });

  it("applies concealed gang by removing four matching tiles from hand", () => {
    const wall = createWallHex({
      40: 36,
      41: 37,
      42: 38,
      43: 39
    });
    const result = simulateTziakchaRecord({
      id: "rec7",
      step: {
        w: wall,
        d: 0,
        a: [[21, 9, 100]]
      }
    });

    expect(result.steps[0].after.players[1].melds).toContainEqual(
      expect.objectContaining({
        type: "gang",
        tileBase: 36,
        concealed: true,
        offeredTileId: null,
        added: false
      })
    );
    expect(result.steps[0].after.players[1].handTiles).not.toEqual(
      expect.arrayContaining([36, 37, 38, 39])
    );
    expect(result.steps[0].after.lastActionWasKong).toBe(true);
    expect(result.steps[0].after.lastActionWasAddedKong).toBe(false);
  });

  it("applies flower replacement by removing flower from hand and tracking replacement draw", () => {
    const wall = createWallHex({
      104: 136
    });
    const result = simulateTziakchaRecord({
      id: "rec8",
      step: {
        w: wall,
        d: 0x1234,
        a: [[49, 0x1000 | 6, 100]]
      }
    });

    expect(result.steps[0].after.players[3].flowerCount).toBe(1);
    expect(result.steps[0].after.players[3].flowerTiles).toEqual([136]);
    expect(result.steps[0].after.players[3].handTiles).toHaveLength(13);
    expect(result.steps[0].after.players[3].handTiles).toContain(6);
    expect(result.steps[0].after.players[3].lastDrawTile).toBe(6);
  });

  it("throws a clear error when removing a tile that is not in hand", () => {
    const wall = createWallHex();

    expect(() =>
      simulateTziakchaRecord({
        id: "rec9",
        step: {
          w: wall,
          d: 0,
          a: [[2, 143, 100]]
        }
      })
    ).toThrow("玩家 0 手牌中不存在牌 143");
  });
});
