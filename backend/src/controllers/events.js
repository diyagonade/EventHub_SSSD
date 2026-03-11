const prisma = require("../lib/prisma");
const sseBroker = require("../lib/sseBroker");

// GET /api/events — public, all events with registration count
const listEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      organizer: { select: { id: true, email: true } },
      _count: { select: { registrations: true } },
    },
  });
  return res.json({ events });
};

// GET /api/events/:id — public
const getEvent = async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      organizer: { select: { id: true, email: true } },
      _count: { select: { registrations: true } },
    },
  });
  if (!event) return res.status(404).json({ message: "Event not found" });
  return res.json({ event });
};

// POST /api/events — ORGANIZER only
const createEvent = async (req, res) => {
  const { title, description, date, capacity } = req.body;

  if (!title || !description || !date || !capacity) {
    return res
      .status(400)
      .json({ message: "title, description, date, and capacity are required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const parsedCapacity = parseInt(capacity, 10);
  if (isNaN(parsedCapacity) || parsedCapacity < 1) {
    return res
      .status(400)
      .json({ message: "capacity must be a positive integer" });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: parsedDate,
      capacity: parsedCapacity,
      organizerId: req.user.id,
    },
    include: {
      organizer: { select: { id: true, email: true } },
      _count: { select: { registrations: true } },
    },
  });

  // Notify all regular users about the new event
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });
  for (const { id: userId } of users) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message: `New Event [${event.id}|new]: "${event.title}" has been added! Check it out and register before it fills up.`,
      },
    });
    sseBroker.publishNotification(userId, notification);
  }

  return res.status(201).json({ event });
};

// PUT /api/events/:id — ORGANIZER, must own event
const updateEvent = async (req, res) => {
  const existing = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { registrations: { select: { userId: true } } },
  });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (existing.organizerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: not your event" });
  }

  const { title, description, date, capacity } = req.body;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (date !== undefined) {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime()))
      return res.status(400).json({ message: "Invalid date format" });
    data.date = parsed;
  }
  if (capacity !== undefined) {
    const parsed = parseInt(capacity, 10);
    if (isNaN(parsed) || parsed < 1)
      return res
        .status(400)
        .json({ message: "capacity must be a positive integer" });
    data.capacity = parsed;
  }

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data,
    include: {
      organizer: { select: { id: true, email: true } },
      _count: { select: { registrations: true } },
    },
  });

  // Notify all registered users about the update
  const userIds = existing.registrations.map((r) => r.userId);
  for (const userId of userIds) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message: `The event "${existing.title}" has been updated by the organizer.`,
      },
    });
    sseBroker.publishNotification(userId, notification);
  }

  return res.json({ event });
};

// DELETE /api/events/:id — ORGANIZER, must own event
const deleteEvent = async (req, res) => {
  const existing = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { registrations: { select: { userId: true } } },
  });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (existing.organizerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: not your event" });
  }

  // Notify all registered users before cascade-deleting
  const userIds = existing.registrations.map((r) => r.userId);
  for (const userId of userIds) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message: `The event "${existing.title}" has been cancelled by the organizer.`,
      },
    });
    sseBroker.publishNotification(userId, notification);
  }

  await prisma.event.delete({ where: { id: req.params.id } });

  return res.json({ message: "Event deleted" });
};

// GET /api/events/my — ORGANIZER: events they created
const myEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { organizerId: req.user.id },
    orderBy: { date: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });
  return res.json({ events });
};

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  myEvents,
};
