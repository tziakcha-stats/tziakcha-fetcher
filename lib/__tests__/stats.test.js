const api = require("../index");

const { summarizeSession: summarizeTziakchaSession } = api.stats;

describe("summarizeTziakchaSession", () => {
  it("summarizes player wins, deal-ins, draws and fan counts", () => {
    const session = {
      sessionId: "sess1",
      players: [
        { name: "A", id: "a-id" },
        { name: "B", id: "b-id" },
        { name: "C", id: "c-id" },
        { name: "D", id: "d-id" }
      ],
      records: [
        {
          id: "ron",
          index: 0,
          step: { b: 1 | (2 << 4), y: [{ f: 24, t: { 23: 24 } }] }
        },
        {
          id: "draw",
          index: 1,
          step: { b: 0, y: [] }
        },
        {
          id: "tsumo",
          index: 2,
          step: { b: 1, y: [{ f: 8, t: { 65: 8 } }] }
        }
      ]
    };

    const summary = summarizeTziakchaSession(session);

    expect(summary.sessionId).toBe("sess1");
    expect(summary.totalRounds).toBe(3);
    expect(summary.finishedRounds).toBe(2);
    expect(summary.drawRounds).toBe(1);
    expect(summary.fanCounts).toEqual({ 平和: 1, 清一色: 1 });
    expect(summary.players[0]).toEqual(
      expect.objectContaining({
        playerName: "A",
        rounds: 3,
        wins: 1,
        ronWins: 1,
        tsumoWins: 0,
        dealIns: 0,
        tsumoAgainst: 1,
        totalFan: 24,
        fanCounts: { 清一色: 1 }
      })
    );
    expect(summary.players[1]).toEqual(
      expect.objectContaining({
        playerName: "B",
        dealIns: 1,
        tsumoAgainst: 1
      })
    );
    expect(summary.players[2]).toEqual(
      expect.objectContaining({
        playerName: "C",
        wins: 1,
        tsumoWins: 1,
        totalFan: 8
      })
    );
  });
});
