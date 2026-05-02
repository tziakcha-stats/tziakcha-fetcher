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

  it("keeps critical intermediate states stable for chi-heavy and add-kong rounds", () => {
    const snapshotCases = [
      {
        recordId: "AcD0xrj2",
        stepIndex: 95,
        playerIndex: 0,
        expected: {
          actionType: "chi",
          lastDiscardTile: 78,
          lastDiscardPlayerIndex: 3,
          lastActionWasKong: false,
          lastActionWasAddedKong: false,
          melds: [
            {
              type: "chi",
              tileIds: [72, 78, 80],
              consumedTileIds: [72, 80],
              offerDirection: 2,
              offerSequence: 1,
              offeredTileId: 78
            }
          ],
          discardsTail: [128, 26, 125, 123],
          handTail: [7, 37, 38, 46, 50, 73, 76, 83, 92, 94]
        }
      },
      {
        recordId: "AcD0xrj2",
        stepIndex: 101,
        playerIndex: 3,
        expected: {
          actionType: "chi",
          lastDiscardTile: 8,
          lastDiscardPlayerIndex: 2,
          lastActionWasKong: false,
          lastActionWasAddedKong: false,
          melds: [
            {
              type: "chi",
              tileIds: [9, 14, 17],
              consumedTileIds: [9, 17],
              offerDirection: 2,
              offerSequence: 1,
              offeredTileId: 14
            },
            {
              type: "chi",
              tileIds: [3, 6, 8],
              consumedTileIds: [3, 6],
              offerDirection: 3,
              offerSequence: 2,
              offeredTileId: 8
            }
          ],
          discardsTail: [112, 1, 65, 49, 64],
          handTail: [18, 20, 25, 36, 39, 48, 87, 89]
        }
      },
      {
        recordId: "9iU63yhz",
        stepIndex: 98,
        playerIndex: 1,
        expected: {
          actionType: "chi",
          lastDiscardTile: 8,
          lastDiscardPlayerIndex: 0,
          lastActionWasKong: false,
          lastActionWasAddedKong: false,
          melds: [
            {
              type: "peng",
              tileBase: 28,
              tileIds: [28, 30, 31],
              offerDirection: 1,
              offerSequence: 2,
              offeredTileId: 30
            },
            {
              type: "chi",
              tileIds: [0, 5, 10],
              consumedTileIds: [5, 10],
              offerDirection: 1,
              offerSequence: 0,
              offeredTileId: 0
            },
            {
              type: "chi",
              tileIds: [1, 6, 8],
              consumedTileIds: [1, 6],
              offerDirection: 3,
              offerSequence: 2,
              offeredTileId: 8
            }
          ],
          discardsTail: [63, 61, 100, 70, 39],
          handTail: [7, 13, 20, 33, 37]
        }
      },
      {
        recordId: "9iU63yhz",
        stepIndex: 81,
        playerIndex: 2,
        expected: {
          actionType: "gang",
          lastDiscardTile: 117,
          lastDiscardPlayerIndex: 2,
          lastActionWasKong: true,
          lastActionWasAddedKong: true,
          melds: [
            {
              type: "gang",
              tileBase: 116,
              tileIds: [116, 117, 118, 119],
              offerDirection: 3,
              offerSequence: 4,
              offeredTileId: 116,
              upgradedFromPeng: true,
              added: true,
              concealed: false
            },
            {
              type: "chi",
              tileIds: [85, 89, 94],
              consumedTileIds: [85, 89],
              offerDirection: 3,
              offerSequence: 2,
              offeredTileId: 94
            }
          ],
          discardsTail: [99, 98, 14, 81, 120],
          handTail: [15, 16, 17, 18, 22, 50, 59]
        }
      },
      {
        recordId: "afXifVDy",
        stepIndex: 31,
        playerIndex: 1,
        expected: {
          actionType: "gang",
          lastDiscardTile: 121,
          lastDiscardPlayerIndex: 1,
          lastActionWasKong: true,
          lastActionWasAddedKong: true,
          melds: [
            {
              type: "gang",
              tileBase: 120,
              tileIds: [120, 121, 122, 123],
              offerDirection: 2,
              offerSequence: 3,
              offeredTileId: 120,
              upgradedFromPeng: true,
              added: true,
              concealed: false
            }
          ],
          discardsTail: [106, 114, 71],
          handTail: [5, 16, 18, 41, 43, 67, 76, 82, 84, 129]
        }
      }
    ];

    for (const testCase of snapshotCases) {
      const roundRecord = sessionFixture.records.find(
        item => item.id === testCase.recordId
      );
      const simulation = record.simulate(roundRecord);
      const stepSnapshot = simulation.steps[testCase.stepIndex];
      const playerState = stepSnapshot.after.players[testCase.playerIndex];

      expect(stepSnapshot.action.typeName).toBe(testCase.expected.actionType);
      expect(stepSnapshot.after.lastDiscardTile).toBe(
        testCase.expected.lastDiscardTile
      );
      expect(stepSnapshot.after.lastDiscardPlayerIndex).toBe(
        testCase.expected.lastDiscardPlayerIndex
      );
      expect(stepSnapshot.after.lastActionWasKong).toBe(
        testCase.expected.lastActionWasKong
      );
      expect(stepSnapshot.after.lastActionWasAddedKong).toBe(
        testCase.expected.lastActionWasAddedKong
      );
      expect(playerState.melds).toEqual(testCase.expected.melds);
      expect(
        playerState.discards.slice(-testCase.expected.discardsTail.length)
      ).toEqual(testCase.expected.discardsTail);
      expect(
        playerState.handTiles.slice(-testCase.expected.handTail.length)
      ).toEqual(testCase.expected.handTail);
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
