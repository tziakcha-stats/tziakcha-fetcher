"use strict";

const FAN_NAMES = [
  "无",
  "大四喜",
  "大三元",
  "绿一色",
  "九莲宝灯",
  "四杠",
  "连七对",
  "十三幺",
  "清幺九",
  "小四喜",
  "小三元",
  "字一色",
  "四暗刻",
  "一色双龙会",
  "一色四同顺",
  "一色四节高",
  "一色四步高",
  "一色四连环",
  "三杠",
  "混幺九",
  "七对",
  "七星不靠",
  "全双刻",
  "清一色",
  "一色三同顺",
  "一色三节高",
  "全大",
  "全中",
  "全小",
  "清龙",
  "三色双龙会",
  "一色三步高",
  "一色三连环",
  "全带五",
  "三同刻",
  "三暗刻",
  "全不靠",
  "组合龙",
  "大于五",
  "小于五",
  "三风刻",
  "花龙",
  "推不倒",
  "三色三同顺",
  "三色三节高",
  "无番和",
  "妙手回春",
  "海底捞月",
  "杠上开花",
  "抢杠和",
  "碰碰和",
  "混一色",
  "三色三步高",
  "五门齐",
  "全求人",
  "双暗杠",
  "双箭刻",
  "全带幺",
  "不求人",
  "双明杠",
  "和绝张",
  "箭刻",
  "圈风刻",
  "门风刻",
  "门前清",
  "平和",
  "四归一",
  "双同刻",
  "双暗刻",
  "暗杠",
  "断幺",
  "一般高",
  "喜相逢",
  "连六",
  "老少副",
  "幺九刻",
  "明杠",
  "缺一门",
  "无字",
  "独听・边张",
  "独听・嵌张",
  "独听・单钓",
  "自摸",
  "花牌",
  "明暗杠",
  "※ 天和",
  "※ 地和",
  "※ 人和Ⅰ",
  "※ 人和Ⅱ"
];

const TZIACKHA_SEAT_TO_PLAYER_ORDER = [
  [0, 1, 2, 3],
  [1, 2, 3, 0],
  [2, 3, 0, 1],
  [3, 0, 1, 2],
  [1, 0, 3, 2],
  [0, 3, 2, 1],
  [3, 2, 1, 0],
  [2, 1, 0, 3],
  [2, 3, 1, 0],
  [3, 1, 0, 2],
  [1, 0, 2, 3],
  [0, 2, 3, 1],
  [3, 2, 0, 1],
  [2, 0, 1, 3],
  [0, 1, 3, 2],
  [1, 3, 2, 0]
];

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
    ((roundIndex % TZIACKHA_SEAT_TO_PLAYER_ORDER.length) +
      TZIACKHA_SEAT_TO_PLAYER_ORDER.length) %
    TZIACKHA_SEAT_TO_PLAYER_ORDER.length;
  return TZIACKHA_SEAT_TO_PLAYER_ORDER[index] || [0, 1, 2, 3];
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

    const seatToPlayerOrder = getSeatToPlayerOrder(record.index);
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
  TZIACKHA_SEAT_TO_PLAYER_ORDER,
  extractTziakchaRoundWinInfos,
  parseTziakchaWinFanItems
};
