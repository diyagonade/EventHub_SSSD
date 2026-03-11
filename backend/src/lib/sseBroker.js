/**
 * SSE Broker — in-memory pub/sub for real-time updates.
 * Carries two event types:
 *   registration_update  — broadcast to ALL clients
 *   new_notification     — sent only to the matching userId
 */

// Map<clientId, { res, userId, heartbeat }>
const clients = new Map();
let nextId = 1;

/**
 * Register a new SSE client.
 * @param {object} res     Express response
 * @param {string} userId  Authenticated user's id
 */
function addClient(res, userId) {
  const id = nextId++;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  clients.set(id, { res, userId, heartbeat });

  res.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(id);
  });

  return id;
}

/**
 * Broadcast a registration count update to every connected client.
 * @param {string} eventId
 * @param {number} count
 */
function publish(eventId, count) {
  const payload = JSON.stringify({ eventId, count });
  for (const { res } of clients.values()) {
    res.write(`event: registration_update\ndata: ${payload}\n\n`);
  }
}

/**
 * Push a new_notification event to all connections belonging to userId.
 * @param {string} userId
 * @param {object} notification  The full notification record
 */
function publishNotification(userId, notification) {
  const payload = JSON.stringify(notification);
  for (const client of clients.values()) {
    if (client.userId === userId) {
      client.res.write(`event: new_notification\ndata: ${payload}\n\n`);
    }
  }
}

module.exports = { addClient, publish, publishNotification };
