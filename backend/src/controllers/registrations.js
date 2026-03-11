const prisma = require("../lib/prisma");
const sseBroker = require("../lib/sseBroker");

// POST /api/registrations — USER registers for an event
const register = async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ message: "eventId is required" });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) return res.status(404).json({ message: "Event not found" });

  if (event._count.registrations >= event.capacity) {
    return res.status(409).json({ message: "Event is at full capacity" });
  }

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId: req.user.id } },
  });
  if (existing) {
    return res
      .status(409)
      .json({ message: "Already registered for this event" });
  }

  const registration = await prisma.registration.create({
    data: { eventId, userId: req.user.id },
    include: { event: { select: { id: true, title: true } } },
  });

  // Notify the organizer
  const notification = await prisma.notification.create({
    data: {
      userId: event.organizerId,
      message: `${req.user.email} registered for "${event.title}".`,
    },
  });
  sseBroker.publishNotification(event.organizerId, notification);

  const updatedCount = event._count.registrations + 1;
  sseBroker.publish(eventId, updatedCount);
  return res
    .status(201)
    .json({ registration, registrationCount: updatedCount });
};

// DELETE /api/registrations/:eventId — USER cancels their registration
const cancel = async (req, res) => {
  const { eventId } = req.params;

  const existing = await prisma.registration.findUnique({
    where: { eventId_userId: { eventId, userId: req.user.id } },
  });
  if (!existing) {
    return res.status(404).json({ message: "Registration not found" });
  }

  await prisma.registration.delete({
    where: { eventId_userId: { eventId, userId: req.user.id } },
  });

  const updatedCount = await prisma.registration.count({ where: { eventId } });
  sseBroker.publish(eventId, updatedCount);
  return res.json({
    message: "Registration cancelled",
    registrationCount: updatedCount,
  });
};

// GET /api/registrations/my — USER: their registered events
const myRegistrations = async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: {
          organizer: { select: { id: true, email: true } },
          _count: { select: { registrations: true } },
        },
      },
    },
  });
  return res.json({ registrations });
};

module.exports = { register, cancel, myRegistrations };
