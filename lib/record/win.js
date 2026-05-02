"use strict";

const { FAN_NAMES, SEAT_PLAYER_ORDERS } = require("../core/config/game");

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseTziakchaWinFanItems(rawT) {
  if (!rawT || typeof rawT !== "object") {
    return [];
  }

  return Object.entries(rawT)
    .map(([fanIndexRaw, encodedRaw]) => {
      const fanIndex = toNumber(fanIndexRaw);
      const encoded = toNumber(encodedRaw);
      if (fanIndex === null || encoded === null) {
        return null;
      }

      const fanIndexInt = Math.floor(fanIndex);
      const encodedInt = Math.floor(encoded);
      const unitFan = encodedInt & 0xff;
      const count = (encodedInt >> 8) + 1;

      return {
        fanIndex: fanIndexInt,
        fanName: FAN_NAMES[fanIndexInt] || `番种${fanIndexInt}`,
        count,
        unitFan,
        totalFan: unitFan * count
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.fanIndex - right.fanIndex);
}

function getSeatToPlayerOrder(roundIndex) {
  const index =
    ((roundIndex % SEAT_PLAYER_ORDERS.length) + SEAT_PLAYER_ORDERS.length) %
    SEAT_PLAYER_ORDERS.length;
  return SEAT_PLAYER_ORDERS[index] || [0, 1, 2, 3];
}

function resolvePlayerIndexByName(session, seatPlayer) {
  const seatName = seatPlayer?.n || seatPlayer?.name;
  if (!seatName || !Array.isArray(session.players)) {
    return null;
  }

  const playerIndex = session.players.findIndex(
    player => (player?.name || player?.n) === seatName
  );
  return playerIndex >= 0 ? playerIndex : null;
}

function getSeatToPlayerOrderForRecord(session, record) {
  const stepPlayers = record?.step?.p;
  if (Array.isArray(stepPlayers) && stepPlayers.length === 4) {
    const resolved = stepPlayers.map(player =>
      resolvePlayerIndexByName(session, player)
    );

    if (resolved.every(index => Number.isInteger(index) && index >= 0)) {
      return resolved;
    }
  }

  return getSeatToPlayerOrder(record?.index || 0);
}

function getPlayerName(session, playerIndex) {
  return session.players[playerIndex]?.name || `Seat ${playerIndex}`;
}

function extractTziakchaRoundWinInfos(session) {
  const rounds = [];

  for (const record of session.records || []) {
    const stepData = record.step || {};
    const resultBits = typeof stepData.b === "number" ? stepData.b : 0;
    const winnerMask = resultBits & 0x0f;
    const discarderMask = (resultBits >> 4) & 0x0f;
    if (!winnerMask) {
      continue;
    }

    const seatToPlayerOrder = getSeatToPlayerOrderForRecord(session, record);
    const winners = [];

    for (let stepSeat = 0; stepSeat < 4; stepSeat += 1) {
      if (((winnerMask >> stepSeat) & 1) === 0) {
        continue;
      }

      const playerIndex = seatToPlayerOrder[stepSeat];
      const seatY = Array.isArray(stepData.y) ? stepData.y[stepSeat] : null;
      const fanItems = parseTziakchaWinFanItems(seatY?.t);
      const totalFan =
        typeof seatY?.f === "number"
          ? seatY.f
          : fanItems.reduce((sum, item) => sum + item.totalFan, 0);

      winners.push({
        playerName: getPlayerName(session, playerIndex),
        playerIndex,
        totalFan,
        fanItems
      });
    }

    const discarders = [];
    for (let stepSeat = 0; stepSeat < 4; stepSeat += 1) {
      if (((discarderMask >> stepSeat) & 1) === 0) {
        continue;
      }

      const playerIndex = seatToPlayerOrder[stepSeat];
      discarders.push({
        playerName: getPlayerName(session, playerIndex),
        playerIndex
      });
    }

    rounds.push({
      roundNo: record.index + 1,
      recordId: record.id,
      winners,
      discarders,
      selfDraw:
        discarders.length === 0 ||
        discarders.every(discarder =>
          winners.some(winner => winner.playerIndex === discarder.playerIndex)
        )
    });
  }

  return rounds;
}

module.exports = {
  FAN_NAMES,
  SEAT_PLAYER_ORDERS,
  extractTziakchaRoundWinInfos,
  parseTziakchaWinFanItems
};
