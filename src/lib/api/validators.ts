import { HttpError } from './errors';

// ─── cleanString ────────────────────────────────────────────────────────────

interface CleanStringOpts {
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

/**
 * 清洗字符串：去除首尾空白，拒绝 `<>` 字符，支持长度范围、正则模式和允许空值。
 */
export function cleanString(
  value: unknown,
  name: string,
  opts: CleanStringOpts = {}
): string {
  const { min = 1, max = 120, pattern, allowEmpty = false } = opts;
  const text = String(value ?? '').trim();
  if (!text && allowEmpty) return '';
  if (text.length < min || text.length > max) {
    throw new HttpError(422, `${name} is invalid`);
  }
  if (/[<>]/.test(text)) {
    throw new HttpError(422, `${name} must not contain html`);
  }
  if (pattern && !pattern.test(text)) {
    throw new HttpError(422, `${name} is invalid`);
  }
  return text;
}

// ─── cleanId ────────────────────────────────────────────────────────────────

/**
 * 清洗 ID：小写字母、数字、下划线、横线，2–64 字符，首字符必须为字母或数字。
 */
export function cleanId(value: unknown, name = 'id'): string {
  return cleanString(value, name, {
    min: 2,
    max: 64,
    pattern: /^[a-z0-9][a-z0-9_-]*$/,
  });
}

// ─── cleanEnum ──────────────────────────────────────────────────────────────

/**
 * 枚举校验：值必须在 `allowed` 集合中，否则抛出 422。
 * 若 `value` 为 `undefined` 且提供了 `fallback`，则使用 fallback。
 */
export function cleanEnum(
  value: unknown,
  name: string,
  allowed: Set<string>,
  fallback?: string
): string {
  const text = value === undefined ? fallback : String(value);
  if (text === undefined || !allowed.has(text)) {
    throw new HttpError(422, `${name} is invalid`);
  }
  return text;
}

// ─── cleanPrice ─────────────────────────────────────────────────────────────

/**
 * 价格校验：正数，最多 5 位整数 + 最多 2 位小数，返回标准化的两位小数字符串。
 */
export function cleanPrice(value: unknown): string {
  const text = String(value ?? '0').trim();
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(text) || Number(text) <= 0) {
    throw new HttpError(422, 'priceUsdt is invalid');
  }
  return Number(text).toFixed(2);
}

// ─── cleanOptionValues ──────────────────────────────────────────────────────

/**
 * 选项值对象校验：key 为字母数字下划线横线（最多 40 字符），value 为普通字符串（最多 80 字符）。
 * 最多保留 12 个键值对。非对象输入返回空对象。
 */
export function cleanOptionValues(
  value: unknown
): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 12)
      .map(([key, val]) => [
        cleanString(key, 'option key', {
          max: 40,
          pattern: /^[a-zA-Z0-9_-]+$/,
        }),
        cleanString(val, 'option value', { max: 80 }),
      ])
  );
}

// ─── cleanOptionGroups ──────────────────────────────────────────────────────

interface OptionGroup {
  key: string;
  options: string[];
}

/**
 * 选项组数组校验：最多 6 组，每组 key 为字母数字下划线横线，options 最多 20 项。
 */
export function cleanOptionGroups(groups: unknown): OptionGroup[] {
  if (!Array.isArray(groups) || groups.length > 6) {
    throw new HttpError(422, 'optionGroups is invalid');
  }
  return groups.map((group) => ({
    key: cleanString(
      (group as Record<string, unknown>)?.key,
      'option group key',
      { max: 40, pattern: /^[a-zA-Z0-9_-]+$/ }
    ),
    options: (
      Array.isArray((group as Record<string, unknown>)?.options)
        ? ((group as Record<string, unknown>).options as unknown[])
        : []
    )
      .slice(0, 20)
      .map((option) => cleanString(option, 'option', { max: 80 })),
  }));
}
