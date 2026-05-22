// Lightweight Hijri date conversion (Umm al-Qura-aligned tabular Islamic calendar).
// Good for display; for fiqh purposes always verify against local moonsighting.

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

export interface HijriDate { day: number; month: number; year: number; monthName: string; }

// Convert Gregorian to tabular Hijri (Kuwaiti algorithm).
export function gregorianToHijri(date: Date): HijriDate {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let jd: number;
  if (year > 1582 || (year === 1582 && month > 10) || (year === 1582 && month === 10 && day > 14)) {
    jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
       + Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12)
       - Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4)
       + day - 32075;
  } else {
    jd = 367 * year - Math.floor((7 * (year + 5001 + Math.floor((month - 9) / 7))) / 4)
       + Math.floor((275 * month) / 9) + day + 1729777;
  }

  const l1 = jd - 1948440 + 10632;
  const n = Math.floor((l1 - 1) / 10631);
  const l2 = l1 - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719))
          + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50))
                 - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName: HIJRI_MONTHS[hMonth - 1] ?? " ",
  };
}

export function formatHijri(d: HijriDate): string {
  return `${d.day} ${d.monthName} ${d.year} AH`;
}

// Important Islamic dates (tabular, verify locally for fiqh purposes)
export function islamicEventsForYear(hYear: number) {
  return [
    { name: "Ramadan begins",         month: 9,  day: 1  },
    { name: "Laylat al-Qadr (odd nights)", month: 9, day: 27 },
    { name: "Eid al-Fitr",            month: 10, day: 1  },
    { name: "Day of Arafah",          month: 12, day: 9  },
    { name: "Eid al-Adha",            month: 12, day: 10 },
    { name: "Islamic New Year",       month: 1,  day: 1  },
    { name: "Day of Ashura",          month: 1,  day: 10 },
  ];
}
