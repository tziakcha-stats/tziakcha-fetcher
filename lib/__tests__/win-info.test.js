const {
  extractTziakchaRoundWinInfos,
  parseTziakchaWinFanItems
} = require("../win-info");

describe("win info helpers", () => {
  it("parses encoded fan items", () => {
    expect(parseTziakchaWinFanItems({ 23: 24, 71: 8 + (1 << 8) })).toEqual([
      {
        fanIndex: 23,
        fanName: "清一色",
        count: 1,
        unitFan: 24,
        totalFan: 24
      },
      {
        fanIndex: 71,
        fanName: "一般高",
        count: 2,
        unitFan: 8,
        totalFan: 16
      }
    ]);
  });

  it("extracts winners, discarders, fan details and self draw flag", () => {
    const session = {
      sessionId: "sess1",
      players: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }],
      records: [
        {
          id: "rec1",
          index: 0,
          step: {
            b: 1 | (2 << 4),
            y: [{ f: 24, t: { 23: 24 } }]
          }
        }
      ]
    };

    expect(extractTziakchaRoundWinInfos(session)).toEqual([
      {
        roundNo: 1,
        recordId: "rec1",
        winners: [
          {
            playerName: "A",
            playerIndex: 0,
            totalFan: 24,
            fanItems: [
              {
                fanIndex: 23,
                fanName: "清一色",
                count: 1,
                unitFan: 24,
                totalFan: 24
              }
            ]
          }
        ],
        discarders: [
          {
            playerName: "B",
            playerIndex: 1
          }
        ],
        selfDraw: false
      }
    ]);
  });
});
