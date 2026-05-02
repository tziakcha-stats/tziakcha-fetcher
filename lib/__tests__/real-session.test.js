"use strict";

/* global fetch */

const { record, session } = require("../index");
const sessionFixture = require("./fixtures/session-ghqy2ztj.json");

describe("real session regression", () => {
  it("aligns GHQY2zTj round outcomes with extracted summary results", async () => {
    const roundSession = sessionFixture;
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
  });

  it("keeps decoded actions and simulated step count consistent for GHQY2zTj", () => {
    expect(sessionFixture.records).toHaveLength(16);

    for (const roundRecord of sessionFixture.records) {
      const rawActions = roundRecord.step.a || [];
      const decodedActions = rawActions.map(action =>
        record.decodeAction(action)
      );
      const simulation = record.simulate(roundRecord);

      expect(simulation.steps).toHaveLength(rawActions.length);
      expect(simulation.steps).toHaveLength(decodedActions.length);

      simulation.steps.forEach((stepSnapshot, index) => {
        const decoded = decodedActions[index];

        expect(stepSnapshot.index).toBe(index);
        expect(stepSnapshot.action.playerIndex).toBe(decoded.playerIndex);
        expect(stepSnapshot.action.type).toBe(decoded.type);
        expect(stepSnapshot.action.typeName).toBe(decoded.typeName);
        expect(stepSnapshot.action.data).toBe(decoded.data);
        expect(stepSnapshot.action.time).toBe(decoded.time);
      });
    }
  });

  it("preserves meld semantics for chi, peng and gang actions in GHQY2zTj", () => {
    const meldActionTypes = new Set(["chi", "peng", "gang"]);

    for (const roundRecord of sessionFixture.records) {
      const simulation = record.simulate(roundRecord);

      for (const stepSnapshot of simulation.steps) {
        const { action } = stepSnapshot;
        if (!meldActionTypes.has(action.typeName) || action.data === 0) {
          continue;
        }

        const afterPlayer = stepSnapshot.after.players[action.playerIndex];
        const latestMeld =
          afterPlayer.melds.length > 0
            ? afterPlayer.melds[afterPlayer.melds.length - 1]
            : null;

        if (action.typeName === "chi") {
          expect(latestMeld).toEqual(
            expect.objectContaining({
              type: "chi",
              offerDirection: action.detail.offerDirection
            })
          );
          expect(latestMeld.tileIds).toHaveLength(3);
          expect(latestMeld.consumedTileIds).toHaveLength(2);
        }

        if (action.typeName === "peng") {
          expect(latestMeld).toEqual(
            expect.objectContaining({
              type: "peng",
              tileBase: action.detail.tileBase,
              offerDirection: action.detail.offerDirection,
              offerSequence: action.detail.offerDirection + 1
            })
          );
          expect(latestMeld.tileIds).toHaveLength(3);
        }

        if (action.typeName === "gang" && action.detail.promoted) {
          expect(afterPlayer.melds).toContainEqual(
            expect.objectContaining({
              type: "gang",
              upgradedFromPeng: true,
              added: true
            })
          );
        }

        if (
          action.typeName === "gang" &&
          !action.detail.promoted &&
          latestMeld
        ) {
          expect(latestMeld).toEqual(
            expect.objectContaining({
              type: "gang",
              tileBase: action.detail.tileBase,
              offerDirection: action.detail.offerDirection
            })
          );
          expect(latestMeld.tileIds).toHaveLength(4);
        }
      }
    }
  });

  it("matches fetched GHQY2zTj payload with the committed fixture when fetch is available", async () => {
    if (typeof fetch !== "function") {
      return;
    }

    const fetchedSession = await session.fetchRounds("GHQY2zTj", {
      fetch
    });

    expect(fetchedSession).toEqual(sessionFixture);
  }, 20000);
});
