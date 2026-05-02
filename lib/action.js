"use strict";

const ACTION_TYPES = {
  NONE: 0,
  FLOWER_REPLACE: 1,
  DISCARD: 2,
  CHI: 3,
  PENG: 4,
  GANG: 5,
  WIN: 6,
  DRAW: 7,
  PASS: 8,
  ABANDON: 9
};

const ACTION_TYPE_NAMES = {
  [ACTION_TYPES.NONE]: "none",
  [ACTION_TYPES.FLOWER_REPLACE]: "flowerReplace",
  [ACTION_TYPES.DISCARD]: "discard",
  [ACTION_TYPES.CHI]: "chi",
  [ACTION_TYPES.PENG]: "peng",
  [ACTION_TYPES.GANG]: "gang",
  [ACTION_TYPES.WIN]: "win",
  [ACTION_TYPES.DRAW]: "draw",
  [ACTION_TYPES.PASS]: "pass",
  [ACTION_TYPES.ABANDON]: "abandon"
};

function decodeDetail(type, data) {
  switch (type) {
    case ACTION_TYPES.FLOWER_REPLACE:
      return {
        drawnTileId: data & 0xff,
        flowerTileId: ((data >> 8) & 0x0f) + 136,
        auto: Boolean(data & 0x1000)
      };
    case ACTION_TYPES.DISCARD:
      return {
        tileId: data & 0xff,
        handPlayed: Boolean((data >> 8) & 1),
        playMode: (data >> 9) & 3
      };
    case ACTION_TYPES.CHI:
      return {
        baseTileId: (data & 0x3f) << 2,
        offerDirection: (data >> 6) & 3,
        offsets: [(data >> 10) & 3, (data >> 12) & 3, (data >> 14) & 3]
      };
    case ACTION_TYPES.PENG:
      return {
        baseTileId: (data & 0x3f) << 2,
        offerDirection: (data >> 6) & 3,
        offset: (data >> 10) & 3
      };
    case ACTION_TYPES.GANG:
      return {
        baseTileId: (data & 0x3f) << 2,
        offerDirection: (data >> 6) & 3,
        offset: (data >> 10) & 3,
        promoted: (data & 0x0300) === 0x0300
      };
    case ACTION_TYPES.WIN:
      return {
        auto: Boolean(data & 1),
        fan: data >> 1
      };
    case ACTION_TYPES.DRAW:
      return {
        tileId: data & 0xff,
        backward: Boolean(data & 0x0100)
      };
    case ACTION_TYPES.PASS:
      return {
        mode: data & 3
      };
    default:
      return {};
  }
}

function decodeTziakchaAction(action) {
  if (!Array.isArray(action) || action.length < 2) {
    throw new Error("tziakcha action 必须是 [combined, data, time] 数组");
  }

  const [combined, data, time] = action;
  const type = combined & 0x0f;

  return {
    playerIndex: (combined >> 4) & 3,
    type,
    typeName: ACTION_TYPE_NAMES[type] || `unknown(${type})`,
    data,
    time,
    detail: decodeDetail(type, data)
  };
}

module.exports = {
  ACTION_TYPES,
  decodeTziakchaAction
};
