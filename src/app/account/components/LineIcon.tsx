"use client";

const ICONS: Record<string, string> = {
  card: "M3 7.5h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 9h4",
  cart: "M6 6h15l-1.5 8.5H8L6 3H3m6 16a1 1 0 1 0 0 .01M18 19a1 1 0 1 0 0 .01",
  calendar: "M8 3v4m8-4v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
  check: "m5 12 4 4L19 6",
  chevron: "m9 18 6-6-6-6",
  "chevron-left": "m15 18-6-6 6-6",
  "chevron-right": "m9 18 6-6-6-6",
  clock: "M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  copy: "M8 8h10v12H8zM6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "eye-off": "m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M7.3 7.5C4 9.2 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8M11 6.1c.3 0 .7-.1 1-.1 6.5 0 10 6 10 6s-.9 1.5-2.4 3",
  headset: "M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v6H5a1 1 0 0 1-1-1v-5Zm13 0h3v5a1 1 0 0 1-1 1h-2v-6Zm0 6c0 1.2-1 2-2.2 2H12",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 16h4",
  refund: "M9 14 4 9l5-5M4 9h11a5 5 0 1 1 0 10h-3",
  search: "M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
  shield: "M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Zm-3 9 2 2 4-5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  usdt: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-5 6h10M9 9c0 1.2 1.3 2 3 2s3 .8 3 2-1.3 2-3 2-3-.8-3-2m3-7v10",
  warning: "M12 9v4m0 4h.01M10.3 4.6 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z",
};

export function LineIcon({ name, label, className }: { name: string; label?: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name] || ICONS.more} />
    </svg>
  );
}
