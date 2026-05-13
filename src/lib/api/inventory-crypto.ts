/**
 * 组件 6：库存加解密 (AES-256-GCM, Web Crypto API)
 *
 * 加密格式：v1:<iv_base64url>:<tag_base64url>:<ciphertext_base64url>
 *
 * Web Crypto AES-GCM 的 encrypt() 输出 = ciphertext + 16-byte tag 拼接，
 * 解密时需要将 ciphertext 和 tag 重新拼接后传入 decrypt()。
 */

/**
 * 将 Uint8Array 编码为 base64url 字符串（无填充）
 */
export function base64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * 将 base64url 字符串解码为 Uint8Array
 */
export function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return view;
}

/**
 * 使用 AES-256-GCM 加密库存值
 *
 * @param value - 明文字符串（如激活码、账号密码等）
 * @param encryptionKey - 加密密钥（任意字符串，内部通过 SHA-256 派生为 256-bit 密钥）
 * @returns 格式为 `v1:<iv_base64url>:<tag_base64url>:<ciphertext_base64url>` 的加密字符串
 */
export async function encryptInventoryValue(
  value: string,
  encryptionKey: string
): Promise<string> {
  // 通过 SHA-256 将任意长度密钥派生为 256-bit AES 密钥
  const keyData = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(encryptionKey)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // 生成随机 12-byte IV（AES-GCM 推荐长度）
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);

  // Web Crypto AES-GCM encrypt 输出 = ciphertext + 16-byte authentication tag
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const ct = new Uint8Array(ciphertext);
  // 分离 ciphertext 和 tag（tag 固定为最后 16 字节）
  const encryptedBytes = ct.slice(0, ct.byteLength - 16);
  const tag = ct.slice(ct.byteLength - 16);

  return `v1:${base64url(iv)}:${base64url(tag)}:${base64url(encryptedBytes)}`;
}

/**
 * 解密 AES-256-GCM 加密的库存值
 *
 * @param encrypted - 格式为 `v1:<iv_base64url>:<tag_base64url>:<ciphertext_base64url>` 的加密字符串
 * @param encryptionKey - 加密时使用的密钥
 * @returns 解密后的明文字符串
 * @throws 若版本不支持、格式错误或解密失败则抛出错误
 */
export async function decryptInventoryValue(
  encrypted: string,
  encryptionKey: string
): Promise<string> {
  const parts = encrypted.split(":");
  if (parts.length !== 4) {
    throw new Error("invalid encrypted value format");
  }
  const [version, ivB64, tagB64, ctB64] = parts;

  if (version !== "v1") {
    throw new Error(`unsupported encryption version: ${version}`);
  }

  // 通过 SHA-256 派生密钥
  const keyData = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(encryptionKey)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = base64urlDecode(ivB64);
  const tag = base64urlDecode(tagB64);
  const ct = base64urlDecode(ctB64);

  // Web Crypto decrypt 期望输入为 ciphertext + tag 拼接
  const combinedBuf = new ArrayBuffer(ct.byteLength + tag.byteLength);
  const combined = new Uint8Array(combinedBuf);
  combined.set(ct);
  combined.set(tag, ct.byteLength);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    combinedBuf
  );

  return new TextDecoder().decode(plaintext);
}
