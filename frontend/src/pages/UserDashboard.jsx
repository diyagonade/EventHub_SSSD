import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { listEvents } from "../api/eventsApi";
import {
  cancelRegistration,
  getMyRegistrations,
  registerForEvent,
} from "../api/registrationsApi";
import EventCard from "../components/EventCard";
import { useRegistrationStream } from "../hooks/useRegistrationStream";

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [myRegEventIds, setMyRegEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState("");

  useRegistrationStream(({ eventId, count }) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, _count: { registrations: count } } : e,
      ),
    );
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eventsRes, regsRes] = await Promise.all([
        listEvents(),
        getMyRegistrations(),
      ]);
      setEvents(eventsRes.data.events);
      setMyRegEventIds(
        new Set(regsRes.data.registrations.map((r) => r.event.id)),
      );
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setActionLoading((p) => ({ ...p, [eventId]: true }));
    try {
      await registerForEvent(eventId);
      setMyRegEventIds((p) => new Set([...p, eventId]));
      // setEvents((prev) =>
      //   prev.map((e) =>
      //     e.id === eventId
      //       ? { ...e, _count: { registrations: e._count.registrations + 1 } }
      //       : e,
      //   ),
      // );
      toast.success("Registered successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setActionLoading((p) => ({ ...p, [eventId]: false }));
    }
  };

  const handleCancel = async (eventId) => {
    setActionLoading((p) => ({ ...p, [eventId]: true }));
    try {
      await cancelRegistration(eventId);
      setMyRegEventIds((p) => {
        const s = new Set(p);
        s.delete(eventId);
        return s;
      });
      // setEvents((prev) =>
      //   prev.map((e) =>
      //     e.id === eventId
      //       ? { ...e, _count: { registrations: e._count.registrations - 1 } }
      //       : e,
      //   ),
      // );
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading((p) => ({ ...p, [eventId]: false }));
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Browse Events</h4>
        <Badge bg="secondary">{events.length} events</Badge>
      </div>

      <InputGroup className="mb-4" style={{ maxWidth: 380 }}>
        <Form.Control
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch("")}>
            ✕
          </Button>
        )}
      </InputGroup>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-center py-5">No events found.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {filtered.map((event) => {
            const isRegistered = myRegEventIds.has(event.id);
            const isFull = event._count.registrations >= event.capacity;
            const busy = !!actionLoading[event.id];

            return (
              <Col key={event.id}>
                <EventCard
                  event={event}
                  actionSlot={
                    isRegistered ? (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleCancel(event.id)}
                        disabled={busy}
                      >
                        {busy ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Cancel"
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull || busy}
                      >
                        {busy ? (
                          <Spinner size="sm" animation="border" />
                        ) : isFull ? (
                          "Full"
                        ) : (
                          "Register"
                        )}
                      </Button>
                    )
                  }
                />
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}
