/**
 * @file base64.ts
 * @module @aetheria/engine/asset-parser/base64
 * @description Bộ mã hoá / giải mã base64 (RFC 4648) tự viết.
 *
 * Dùng thay `btoa` / `atob` vì:
 *  • không phụ thuộc môi trường (Node, trình duyệt, worker đều chạy được),
 *  • `String.fromCharCode(...bytes)` tràn call-stack với buffer vài chục KB —
 *    bản ở đây nối chuỗi theo từng nhóm nên không giới hạn kích thước.
 */

/** Bảng ký tự base64 chuẩn. */
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Bảng tra ký tự → giá trị 6 bit. */
const BASE64_VALUES = (() => {
  const table = new Int16Array(256).fill(-1);
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    table[BASE64_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

/** Mã hoá byte thành chuỗi base64. */
export function encodeBase64(bytes: Uint8Array): string {
  let out = '';
  const length = bytes.length;
  let i = 0;

  for (; i + 2 < length; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      BASE64_ALPHABET[(chunk >> 18) & 63] +
      BASE64_ALPHABET[(chunk >> 12) & 63] +
      BASE64_ALPHABET[(chunk >> 6) & 63] +
      BASE64_ALPHABET[chunk & 63];
  }

  const rest = length - i;
  if (rest === 1) {
    const chunk = bytes[i] << 16;
    out += BASE64_ALPHABET[(chunk >> 18) & 63] + BASE64_ALPHABET[(chunk >> 12) & 63] + '==';
  } else if (rest === 2) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out +=
      BASE64_ALPHABET[(chunk >> 18) & 63] +
      BASE64_ALPHABET[(chunk >> 12) & 63] +
      BASE64_ALPHABET[(chunk >> 6) & 63] +
      '=';
  }

  return out;
}

/** Giải mã chuỗi base64 thành byte. */
export function decodeBase64(input: string): Uint8Array {
  const out = new Uint8Array(Math.floor((input.length * 3) / 4));
  let outIndex = 0;
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const value = code < 256 ? BASE64_VALUES[code] : -1;
    if (value < 0) continue; // bỏ qua ký tự không thuộc base64 (=, xuống dòng…)
    buffer = ((buffer << 6) | value) & 0x3fff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[outIndex++] = (buffer >> bits) & 0xff;
    }
  }

  return out.subarray(0, outIndex);
}
