const { ACTION_TYPES, decodeTziakchaAction } = require("../action");

describe("decodeTziakchaAction", () => {
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
