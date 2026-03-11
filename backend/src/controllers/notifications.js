const prisma = require("../lib/prisma");

// GET /api/notifications — user's notifications, unread first
const listNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });
  return res.json({ notifications });
};

// PATCH /api/notifications/:id/read — mark one read
const markRead = async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  if (notification.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  return res.json({ notification: updated });
};

// PATCH /api/notifications/read-all — mark all read for current user
const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  return res.json({ message: "All notifications marked as read" });
};

module.exports = { listNotifications, markRead, markAllRead };
