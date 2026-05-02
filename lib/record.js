"use strict";

const zlib = require("zlib");
const { assertOk, buildUrl, getFetch, mergeHeaders } = require("./http");

function decompressZlibBase64(input) {
  return Promise.resolve().then(() => {
    const compressed = Buffer.from(input, "base64");
    return zlib
      .inflateSync(compressed)
      .toString("utf8")
      .replace(/\0/g, "");
  });
}

async function decodeRecordStep(recordId, raw, options = {}) {
  if (raw.script === "<Decoded>" && raw.step && typeof raw.step === "object") {
    return raw.step;
  }

  if (typeof raw.script !== "string" || !raw.script) {
    throw new Error(`record ${recordId} 缺少 script`);
  }

  const decode = options.decompressZlibBase64 || decompressZlibBase64;

  try {
    return JSON.parse(await decode(raw.script));
  } catch (error) {
    throw new Error(`record ${recordId} script 解码失败: ${error.message}`);
  }
}

async function fetchTziakchaRecord(recordId, options = {}) {
  const endpoint = "/_qry/record/";
  const response = await getFetch(options)(buildUrl(endpoint, options), {
    method: "POST",
    headers: mergeHeaders(options, {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    }),
    body: new URLSearchParams({ id: recordId }).toString()
  });
  assertOk(response, endpoint);

  const raw = await response.json();
  const step = await decodeRecordStep(recordId, raw, options);

  return {
    id: raw.id || recordId,
    belongs: raw.belongs,
    script: "<Decoded>",
    step,
    raw
  };
}

async function fetchTziakchaRecordStep(recordId, options = {}) {
  const record = await fetchTziakchaRecord(recordId, options);
  return record.step;
}

module.exports = {
  decompressZlibBase64,
  fetchTziakchaRecord,
  fetchTziakchaRecordStep
};
