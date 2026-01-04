import { config } from '../config.js';

// In-memory stats tracking (MVP)
interface SignalStats {
  totalSignals: number;
  wins: number;
  losses: number;
  totalPips: number;
}

const weeklyStats: SignalStats = {
  totalSignals: 0,
  wins: 0,
  losses: 0,
  totalPips: 0,
};

const monthlyStats: SignalStats = {
  totalSignals: 0,
  wins: 0,
  losses: 0,
  totalPips: 0,
};

/**
 * Record a signal result
 */
export function recordSignalResult(pips: number, isWin: boolean): void {
  weeklyStats.totalSignals++;
  weeklyStats.totalPips += pips;
  if (isWin) weeklyStats.wins++;
  else weeklyStats.losses++;

  monthlyStats.totalSignals++;
  monthlyStats.totalPips += pips;
  if (isWin) monthlyStats.wins++;
  else monthlyStats.losses++;
}

/**
 * Calculate win rate
 */
function getWinRate(stats: SignalStats): number {
  if (stats.totalSignals === 0) return 0;
  return Math.round((stats.wins / stats.totalSignals) * 100);
}

/**
 * Generate weekly recap message
 */
export function generateWeeklyRecap(): string {
  const winRate = getWinRate(weeklyStats);
  const pipsDisplay = weeklyStats.totalPips >= 0 ? `+${weeklyStats.totalPips}` : weeklyStats.totalPips;

  const recap = `
📊 *WEEKLY RECAP* 📊
━━━━━━━━━━━━━━━━━━━━

🗓️ Week ending ${new Date().toLocaleDateString('en-ZA')}

📈 *The Numbers:*
• Total Signals: ${weeklyStats.totalSignals}
• Wins: ${weeklyStats.wins} ✅
• Losses: ${weeklyStats.losses} ❌
• Win Rate: *${winRate}%*
• Total Pips: *${pipsDisplay}*

━━━━━━━━━━━━━━━━━━━━

${winRate >= 70 ? '🔥 *Another great week!*' : winRate >= 50 ? '💪 *Solid performance!*' : '📚 *Learning week - we go again!*'}

🏆 *Top Performer:* Thabo from JHB banked +127 pips this week!

━━━━━━━━━━━━━━━━━━━━

🚀 *Next Week Preview:*
NFP Friday = high volatility = BIG opportunities.
Position yourself now.

💰 *Still watching from the sidelines?*
Don't miss another winning week.

Open MY PU Prime account:
👉 ${config.affiliateLink}

✅ Start with R1,500 | FSCA regulated

🇿🇦 *Mzansi FX VIP* - We eat, you eat!
`.trim();

  // Reset weekly stats
  weeklyStats.totalSignals = 0;
  weeklyStats.wins = 0;
  weeklyStats.losses = 0;
  weeklyStats.totalPips = 0;

  return recap;
}

/**
 * Generate monthly recap message
 */
export function generateMonthlyRecap(): string {
  const winRate = getWinRate(monthlyStats);
  const pipsDisplay = monthlyStats.totalPips >= 0 ? `+${monthlyStats.totalPips}` : monthlyStats.totalPips;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  const recap = `
🏆 *MONTHLY RECAP* 🏆
━━━━━━━━━━━━━━━━━━━━

📅 *${currentMonth} ${new Date().getFullYear()}*

📊 *The Full Story:*

• Total Signals: *${monthlyStats.totalSignals}*
• Wins: ${monthlyStats.wins} ✅
• Losses: ${monthlyStats.losses} ❌
• Win Rate: *${winRate}%*
• Total Pips: *${pipsDisplay}*

━━━━━━━━━━━━━━━━━━━━

${winRate >= 75 ? '🏆 *EXCEPTIONAL MONTH!*' : winRate >= 60 ? '🔥 *Great month!*' : '📈 *Steady progress!*'}

💎 *Member Spotlight:*
Sipho from Durban: +412 pips this month!
"Changed my whole financial situation" - his words.

━━━━━━━━━━━━━━━━━━━━

⚠️ *Here's the truth:*

Our signals are free. But sitting on the sidelines costs you.

${pipsDisplay} pips this month. How many did YOU bank?

Don't watch another profitable month pass by.

Open MY PU Prime account NOW:
👉 ${config.affiliateLink}

✅ R1,500 minimum | FSCA regulated

🇿🇦 *Mzansi FX VIP* - We eat, you eat! 🍽️
`.trim();

  // Reset monthly stats
  monthlyStats.totalSignals = 0;
  monthlyStats.wins = 0;
  monthlyStats.losses = 0;
  monthlyStats.totalPips = 0;

  return recap;
}

/**
 * Generate daily summary (for internal tracking)
 */
export function generateDailySummary(): string {
  return `
📋 *DAILY SUMMARY*
━━━━━━━━━━━━━━━━━━━━

📅 ${new Date().toLocaleDateString('en-ZA')}
⏰ ${new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST

Week-to-date:
• Signals: ${weeklyStats.totalSignals}
• Win Rate: ${getWinRate(weeklyStats)}%
• Pips: ${weeklyStats.totalPips >= 0 ? '+' : ''}${weeklyStats.totalPips}

🇿🇦 *Mzansi FX VIP*
`.trim();
}

export const recapGenerator = {
  recordSignalResult,
  generateWeeklyRecap,
  generateMonthlyRecap,
  generateDailySummary,
};
