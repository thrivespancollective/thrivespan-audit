// FSSH2K Forward — THE MEASURE WEEKS. One shared schedule, one send to everyone.
// Juls, 2026-09-29: quarterly Measure Week, first full week of the quarter, plus one
// Build-cohort capture before their week-28 finish (started 2026-06-06; extended to 28
// weeks by Juls 2026-09-29 for the holiday + the missed Monday → ends ~2026-12-19).
// The week-of-9/29 capture is everyone's starting line. A new member logs her
// starting numbers when she joins, then measures with everyone at the next one.
// "book labs" goes out 14 days before each Monday; "it's Measure Week" on the Monday.

export const MEASURE_WEEKS = [
  { id: "2026-12-build", monday: "2026-12-07", who: "build" },
  { id: "2027-q1", monday: "2027-01-04", who: "all" },
  { id: "2027-q2", monday: "2027-04-05", who: "all" },
  { id: "2027-q3", monday: "2027-07-05", who: "all" },
  { id: "2027-q4", monday: "2027-10-04", who: "all" },
];

const DAY = 24 * 60 * 60 * 1000;
const at = (ymd) => new Date(`${ymd}T12:00:00-06:00`).getTime(); // noon CT

// What is due today: [{ week, kind: "book" | "capture" }]
export function dueToday(now = Date.now()) {
  const due = [];
  for (const w of MEASURE_WEEKS) {
    const monday = at(w.monday);
    if (now >= monday - 14 * DAY && now < monday) due.push({ week: w, kind: "book" });
    if (now >= monday && now < monday + 7 * DAY) due.push({ week: w, kind: "capture" });
  }
  return due;
}

export function nextMeasureWeek(now = Date.now(), who = "all") {
  return MEASURE_WEEKS.find((w) => at(w.monday) >= now - 7 * DAY && (w.who === "all" || w.who === who)) || null;
}
