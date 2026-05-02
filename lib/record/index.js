"use strict";

const { decodeTziakchaAction } = require("./actions");
const { analyzeTziakchaRecord } = require("./analyze");
const {
  decompressZlibBase64,
  fetchTziakchaRecord,
  fetchTziakchaRecordStep
} = require("./fetch");
const { simulateTziakchaRecord } = require("./simulate");
const {
  extractTziakchaRoundWinInfos,
  parseTziakchaWinFanItems
} = require("./win");

module.exports = {
  analyze: analyzeTziakchaRecord,
  decodeAction: decodeTziakchaAction,
  decompress: decompressZlibBase64,
  extractWins: extractTziakchaRoundWinInfos,
  fetch: fetchTziakchaRecord,
  fetchStep: fetchTziakchaRecordStep,
  parseWinFanItems: parseTziakchaWinFanItems,
  simulate: simulateTziakchaRecord
};
