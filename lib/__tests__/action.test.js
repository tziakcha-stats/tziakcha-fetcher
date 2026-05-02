const { ACTION_TYPES, decodeTziakchaAction } = require("../action");

describe("decodeTziakchaAction", () => {
  it("rejects invalid action tuples", () => {
    expect(() => decodeTziakchaAction(null)).toThrow(
      "tziakcha action 必须是 [combined, data, time] 数组"
    );
    expect(() => decodeTziakchaAction([1, 2])).toThrow(
      "tziakcha action 必须是 [combined, data, time] 数组"
    );
    expect(() => decodeTziakchaAction(["x", 2, 3])).toThrow(
      "tziakcha action combined/data/time 必须是数字"
    );
  });

  it("decodes common action envelope", () => {
    expect(decodeTziakchaAction([40, 2, 6812])).toEqual({
      playerIndex: 2,
      type: ACTION_TYPES.PASS,
      typeName: "pass",
      data: 2,
      time: 6812,
      detail: { mode: 2 }
    });
  });

  it("decodes discard detail", () => {
    expect(decodeTziakchaAction([2, 364, 7827])).toEqual(
      expect.objectContaining({
        playerIndex: 0,
        typeName: "discard",
        detail: {
          tileId: 108,
          handPlayed: true,
          playMode: 0
        }
      })
    );
  });

  it("decodes normalized meld metadata", () => {
    expect(decodeTziakchaAction([19, 17667, 1000])).toEqual(
      expect.objectContaining({
        playerIndex: 1,
        typeName: "chi",
        detail: expect.objectContaining({
          tileBase: 12,
          offerDirection: 0,
          offsets: [1, 0, 1],
          candidateTileIds: [9, 12, 17]
        })
      })
    );

    expect(decodeTziakchaAction([20, 1092, 1000])).toEqual(
      expect.objectContaining({
        playerIndex: 1,
        typeName: "peng",
        detail: expect.objectContaining({
          tileBase: 16,
          actualTileId: 17,
          offerDirection: 1
        })
      })
    );

    expect(decodeTziakchaAction([21, 3908, 1000])).toEqual(
      expect.objectContaining({
        playerIndex: 1,
        typeName: "gang",
        detail: expect.objectContaining({
          tileBase: 16,
          actualTileId: 19,
          offerDirection: 1,
          promoted: true,
          concealed: false
        })
      })
    );

    expect(decodeTziakchaAction([21, 4, 1000])).toEqual(
      expect.objectContaining({
        playerIndex: 1,
        typeName: "gang",
        detail: expect.objectContaining({
          tileBase: 16,
          actualTileId: 16,
          offerDirection: 0,
          promoted: false,
          concealed: true
        })
      })
    );
  });

  it("decodes win detail", () => {
    expect(decodeTziakchaAction([22, 49, 1000])).toEqual(
      expect.objectContaining({
        playerIndex: 1,
        typeName: "win",
        detail: {
          auto: true,
          fan: 24
        }
      })
    );
  });
});
