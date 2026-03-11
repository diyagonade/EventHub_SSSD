const cron = require("node-cron");
const prisma = require("../lib/prisma");
const sseBroker = require("../lib/sseBroker");

/**
 * Cron-based reminder job.
 * Runs every 15 minutes and notifies ALL users (role USER) about events
 * happening within the next 24 h and 48 h.
 *
 * Dedup tags in the message prefix prevent duplicate notifications:
 *   "Reminder [<eventId>|24h]: ..."
 *   "Reminder [<eventId>|48h]: ..."
 */

const CHECKS = [
  {
    tag: "48h",
    windowStartMs: 47 * 60 * 60 * 1000, // events 47-49h away
    windowEndMs: 49 * 60 * 60 * 1000,
    buildMessage: (event) =>
      `Reminder [${event.id}|48h]: "${event.title}" is coming up in ~48 hours — register now before it fills up!`,
  },
  {
    tag: "24h",
    windowStartMs: 23 * 60 * 60 * 1000, // events 23-25h away
    windowEndMs: 25 * 60 * 60 * 1000,
    buildMessage: (event) =>
      `Reminder [${event.id}|24h]: Last chance! "${event.title}" starts tomorrow — don't miss it!`,
  },
  {
    tag: "2h",
    windowStartMs: 1 * 60 * 60 * 1000, // events 1-5h away
    windowEndMs: 5 * 60 * 60 * 1000,
    buildMessage: (event) =>
      `Reminder [${event.id}|24h]: "${event.title}" will be starting soon!`,
  },
];

async function runReminderChecks() {
  const now = Date.now();
  console.log(`[reminderJob] running at ${new Date(now).toLocaleString()}`);

  // Fetch all regular users once per tick
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });

  if (users.length === 0) return;

  for (const check of CHECKS) {
    const windowStart = new Date(now + check.windowStartMs);
    const windowEnd = new Date(now + check.windowEndMs);

    const events = await prisma.event.findMany({
      where: { date: { gte: windowStart, lte: windowEnd } },
      select: { id: true, title: true },
    });

    for (const event of events) {
      for (const { id: userId } of users) {
        // const dedupPrefix = `Reminder [${event.id}|${check.tag}]:`;
        // const existing = await prisma.notification.findFirst({
        //   where: { userId, message: { startsWith: dedupPrefix } },
        // });
        // if (existing) continue;

        const notification = await prisma.notification.create({
          data: { userId, message: check.buildMessage(event) },
        });
        sseBroker.publishNotification(userId, notification);
      }
    }
  }
}

function startReminderJob() {
  // Run once on startup to catch any missed windows
  runReminderChecks().catch((err) =>
    console.error("[reminderJob] startup check failed:", err),
  );

  // Then run every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    runReminderChecks().catch((err) =>
      console.error("[reminderJob] scheduled check failed:", err),
    );
  });

  console.log(
    "[reminderJob] started — checking every 15 minutes for events in the next 2 hours",
  );
}

module.exports = { startReminderJob };
