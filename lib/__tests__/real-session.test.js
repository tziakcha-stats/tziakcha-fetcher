"use strict";

/* global fetch */

const { record, session } = require("../index");

describe("real session regression", () => {
  it("aligns GHQY2zTj round outcomes with extracted summary results", async () => {
    if (typeof fetch !== "function") {
      return;
    }

    const roundSession = await session.fetchRounds("GHQY2zTj", {
      fetch
    });
    const summaryWins = new Map(
      record.extractWins(roundSession).map(item => [item.recordId, item])
    );

    expect(roundSession.records).toHaveLength(16);

    for (const roundRecord of roundSession.records) {
      const summary = summaryWins.get(roundRecord.id);
      const analysis = record.analyze(roundRecord, {
        throwOnProblem: false,
        sessionPlayers: roundSession.players
      });

      expect(summary).toBeTruthy();
      expect(analysis.problems).toEqual([]);
      expect(analysis.winner.playerIndex).toBe(summary.winners[0].playerIndex);
      expect(analysis.winner.playerName).toBe(summary.winners[0].playerName);
      expect(analysis.selfDraw).toBe(summary.selfDraw);
      expect(analysis.scriptedWin.totalFan).toBe(summary.winners[0].totalFan);

      if (summary.discarders.length === 0) {
        expect(analysis.discarder).toBeNull();
      } else {
        expect(analysis.discarder.playerIndex).toBe(
          summary.discarders[0].playerIndex
        );
        expect(analysis.discarder.playerName).toBe(
          summary.discarders[0].playerName
        );
      }
    }
  }, 20000);
});
