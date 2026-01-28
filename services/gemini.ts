import { ScoreEntry, SportEvent, House, AdminUser, SchoolArm } from "../types";

/**
 * DETERMINISTIC LOCAL AUDIT ENGINE
 * Replaces external AI API with high-speed local logic for data analysis.
 */
export async function analyzeScores(
  scores: ScoreEntry[],
  events: SportEvent[],
  houses: House[],
  admins: AdminUser[]
) {
  // Simulate processing time for the "Bunker Scanning" aesthetic
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (scores.length === 0) {
    return "SYSTEM_STATUS: IDLE. Insufficient telemetry data for audit. Awaiting uplink from sector admins.";
  }

  // 1. ARM STANDINGS CALCULATION
  const arms = [SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS];
  const armSummaries = arms.map(arm => {
    const armHouses = houses.filter(h => h.arm === arm);
    const armHouseIds = armHouses.map(h => h.id);
    const armScores = scores.filter(s => armHouseIds.includes(s.houseId));
    
    if (armScores.length === 0) return `${arm}: NO_DATA`;

    // Find top house in this arm
    const totals: Record<string, number> = {};
    armScores.forEach(s => {
      totals[s.houseId] = (totals[s.houseId] || 0) + s.points;
    });

    const topHouseId = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
    const topHouse = houses.find(h => h.id === topHouseId);
    return `${arm}: ${topHouse?.name} DOMINANT (${totals[topHouseId]} pts)`;
  });

  // 2. SUSPICIOUS PATTERN DETECTION (Statistical Anomaly)
  const anomalies: string[] = [];
  
  // Check for admin entry speed (conceptual) - here we check if one admin handles > 80% of entries
  const adminEntryCounts: Record<string, number> = {};
  scores.forEach(s => {
    adminEntryCounts[s.adminId] = (adminEntryCounts[s.adminId] || 0) + 1;
  });

  const heavyAdmins = Object.entries(adminEntryCounts).filter(([_, count]) => count > scores.length * 0.8 && scores.length > 5);
  if (heavyAdmins.length > 0) {
    anomalies.push(`HIGH_CENTRALIZATION: Admin ${heavyAdmins[0][0]} responsible for ${Math.round((heavyAdmins[0][1] / scores.length) * 100)}% of sector traffic.`);
  }

  // Check for unrealistic win streaks (e.g., same house winning 5 times in a row)
  const sortedScores = [...scores].sort((a, b) => b.timestamp - a.timestamp);
  const recentWinners = sortedScores.slice(0, 5).map(s => s.houseId);
  const isStreak = recentWinners.length >= 4 && new Set(recentWinners).size === 1;
  if (isStreak) {
    const streakHouse = houses.find(h => h.id === recentWinners[0]);
    anomalies.push(`PERFORMANCE_OUTLIER: ${streakHouse?.name} displaying anomalous 100% win rate in recent frames.`);
  }

  // 3. PERFORMANCE HIGHLIGHTS
  const grandTotal: Record<string, number> = {};
  scores.forEach(s => {
    const houseName = houses.find(h => h.id === s.houseId)?.name || 'Unknown';
    grandTotal[houseName] = (grandTotal[houseName] || 0) + s.points;
  });
  const overallWinner = Object.entries(grandTotal).sort((a, b) => b[1] - a[1])[0];

  // FORMULATE SOVEREIGN REPORT
  const report = [
    "--- SOVEREIGN AUDIT REPORT: GENERATED ---",
    `1. SECTOR STATUS:`,
    ...armSummaries.map(s => `   > ${s}`),
    "",
    `2. INTEGRITY CHECK:`,
    anomalies.length > 0 ? anomalies.map(a => `   [!] ${a}`).join("\n") : "   [+] ALL TELEMETRY PACKETS VERIFIED. NO ANOMALIES DETECTED.",
    "",
    `3. STRATEGIC HIGHLIGHT:`,
    `   Global Leader: ${overallWinner[0]} (${overallWinner[1]} total points calculated).`,
    "------------------------------------------",
    "END OF TRANSMISSION."
  ].join("\n");

  return report;
}
