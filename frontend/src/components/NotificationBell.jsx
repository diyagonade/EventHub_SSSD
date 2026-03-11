import { useEffect, useState } from "react";
import { Badge, Dropdown, ListGroup, Spinner } from "react-bootstrap";
import { BellFill } from "react-bootstrap-icons";
import {
  getNotifications,
  markAllRead,
  markRead,
} from "../api/notificationsApi";
import { useNotificationStream } from "../hooks/useNotificationStream";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time: prepend incoming notifications instantly
  useNotificationStream((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpen = async (isOpen) => {
    setOpen(isOpen);
  };

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setLoading(false);
  };

  return (
    <Dropdown show={open} onToggle={handleOpen} align="end">
      <Dropdown.Toggle
        as="div"
        style={{ cursor: "pointer", position: "relative" }}
        bsPrefix=" "
      >
        <BellFill size={20} className="text-white" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            style={{
              position: "absolute",
              top: -6,
              right: -8,
              fontSize: "0.65rem",
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ minWidth: 340, maxHeight: 420, overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <strong>Notifications</strong>
          {unreadCount > 0 && (
            <span
              role="button"
              className="text-primary small"
              onClick={handleMarkAllRead}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Mark all read"
              )}
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-3 py-3 text-muted small text-center">
            No notifications
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((n) => {
              const isReminder = n.message.startsWith("Reminder [");
              const isNewEvent = n.message.startsWith("New Event [");
              let displayMessage = n.message;
              let icon = "";
              let bgClass = "";
              if (isReminder) {
                icon = "\uD83D\uDD50 ";
                displayMessage = n.message.replace(
                  /^Reminder \[[^\]]+\]: /,
                  "",
                );
                bgClass = !n.isRead ? "bg-warning bg-opacity-10" : "";
              } else if (isNewEvent) {
                icon = "\uD83C\uDF89 ";
                displayMessage = n.message.replace(
                  /^New Event \[[^\]]+\]: /,
                  "",
                );
                bgClass = !n.isRead ? "bg-success bg-opacity-10" : "";
              } else {
                bgClass = !n.isRead ? "bg-light" : "";
              }
              return (
                <ListGroup.Item
                  key={n.id}
                  className={`small py-2 px-3 ${bgClass}`}
                  style={{ cursor: n.isRead ? "default" : "pointer" }}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <div>
                    {icon}
                    {displayMessage}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                    {new Date(n.createdAt).toLocaleString()}
                    {!n.isRead && (
                      <span className="ms-2 text-primary">● unread</span>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
