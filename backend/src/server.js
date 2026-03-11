const app = require("./app");
const { startReminderJob } = require("./jobs/reminderJob");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReminderJob();
});
