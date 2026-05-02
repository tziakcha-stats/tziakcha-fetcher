"use strict";

const discardWinRecord = require("./fixtures/record-discard-win.json");
const selfDrawRecord = require("./fixtures/record-self-draw.json");
const api = require("../index");

const { analyze: analyzeTziakchaRecord } = api.record;

function createWallHex(overrides = {}) {
  return Array.from({ length: 144 }, (_, index) => {
    const tileId = Object.prototype.hasOwnProperty.call(overrides, index)
      ? overrides[index]
      : index;
    return tileId.toString(16).padStart(2, "0");
  }).join("");
}

describe("analyze-record", () => {
  it("analyzes a self-draw win from simulated state and injected calculator", () => {
    const fanCalculator = jest.fn(input => ({
      totalFan: 49,
      breakdown: [{ name: "Self Draw", fan: 49 }],
      received: input
    }));

    const result = analyzeTziakchaRecord(selfDrawRecord, { fanCalculator });

    expect(result.recordId).toBe("record-self-draw");
    expect(result.winner).toEqual({
      seat: 0,
      playerIndex: 0,
      playerName: null
    });
    expect(result.discarder).toBeNull();
    expect(result.selfDraw).toBe(true);
    expect(result.winTile).toBe(53);
    expect(result.roundWind).toBe("E");
    expect(result.seatWind).toBe("E");
    expect(result.envFlags).toEqual({
      roundWind: "E",
      seatWind: "E",
      selfDraw: true,
      lastCopy: false,
      seaLast: false,
      robbingKong: false
    });
    expect(result.handStringForGb).toBe("1m6666pEEEECCCC5s|EE1000");
    expect(result.scriptedWin).toEqual({
      totalFan: 49,
      fanDetails: [
        {
          fanIndex: 81,
          fanName: "独听・单钓",
          count: 1,
          unitFan: 1,
          totalFan: 1
        }
      ]
    });
    expect(result.calculatedFan).toEqual({
      totalFan: 49,
      breakdown: [{ name: "Self Draw", fan: 49 }],
      received: {
        hand: "1m6666pEEEECCCC5s",
        winTile: 53,
        winnerSeat: 0,
        roundWind: "E",
        seatWind: "E",
        selfDraw: true,
        envFlags: "EE1000",
        packs: [],
        flowers: []
      }
    });
    expect(fanCalculator).toHaveBeenCalledTimes(1);
  });

  it("analyzes a discard win and maps round/seat winds", () => {
    const result = analyzeTziakchaRecord(discardWinRecord);

    expect(result.recordId).toBe("record-discard-win");
    expect(result.winner).toEqual({
      seat: 1,
      playerIndex: 1,
      playerName: null
    });
    expect(result.discarder).toEqual({
      seat: 0,
      playerIndex: 0,
      playerName: null
    });
    expect(result.selfDraw).toBe(false);
    expect(result.winTile).toBe(0);
    expect(result.roundWind).toBe("S");
    expect(result.seatWind).toBe("S");
    expect(result.handStringForGb).toBe("7777pSSSSFFFF1m|SS0000");
    expect(result.scriptedWin).toEqual({
      totalFan: 24,
      fanDetails: [
        { fanIndex: 23, fanName: "清一色", count: 1, unitFan: 24, totalFan: 24 }
      ]
    });
    expect(result.calculatedFan).toEqual(
      expect.objectContaining({
        totalFan: expect.any(Number)
      })
    );
  });

  it("reports a structured problem when winner script data is missing", () => {
    const brokenRecord = {
      id: "record-broken",
      step: {
        w: selfDrawRecord.step.w,
        d: selfDrawRecord.step.d,
        b: 1,
        a: selfDrawRecord.step.a,
        y: []
      }
    };

    expect(() => analyzeTziakchaRecord(brokenRecord)).toThrow(
      "step.y 缺少与赢家 seat 0 对应的和牌数据"
    );

    const result = analyzeTziakchaRecord(brokenRecord, {
      onProblem: problem => problem
    });

    expect(result.problems).toEqual([
      {
        code: "WIN_DATA_MISSING",
        message: "step.y 缺少与赢家 seat 0 对应的和牌数据",
        winnerSeat: 0
      }
    ]);
  });

  it("uses gb-mahjong-js as the default fan calculator", () => {
    const result = analyzeTziakchaRecord(selfDrawRecord);

    expect(result.calculatedFan).toEqual(
      expect.objectContaining({
        totalFan: expect.any(Number)
      })
    );
  });

  it("sets robbingKong when a discard win follows an added kong", () => {
    const robbingKongRecord = {
      id: "record-robbing-kong",
      step: {
        w: createWallHex({
          36: 36,
          40: 40,
          41: 41,
          42: 42,
          43: 43,
          52: 40,
          53: 41,
          54: 42,
          55: 43
        }),
        d: 0,
        i: 0,
        a: [
          [2, 36, 100],
          [20, 1098, 200],
          [6, 0, 300],
          [7, 22, 400],
          [21, 3914, 700],
          [8, 0, 750],
          [38, 16, 800]
        ],
        b: 0b00100100,
        y: [
          null,
          null,
          {
            f: 8,
            t: { 49: 8 }
          },
          null
        ]
      }
    };

    const result = analyzeTziakchaRecord(robbingKongRecord, {
      fanCalculator: () => null
    });

    expect(result.winner).toEqual({
      seat: 2,
      playerIndex: 2,
      playerName: null
    });
    expect(result.discarder).toEqual({
      seat: 1,
      playerIndex: 1,
      playerName: null
    });
    expect(result.selfDraw).toBe(false);
    expect(result.envFlags.robbingKong).toBe(true);
  });
});
