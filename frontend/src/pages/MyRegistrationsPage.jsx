import { useEffect, useState } from "react";
import { Badge, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  cancelRegistration,
  getMyRegistrations,
} from "../api/registrationsApi";
import EventCard from "../components/EventCard";

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await getMyRegistrations();
      setRegistrations(res.data.registrations);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    setActionLoading((p) => ({ ...p, [eventId]: true }));
    try {
      await cancelRegistration(eventId);
      setRegistrations((prev) => prev.filter((r) => r.event.id !== eventId));
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading((p) => ({ ...p, [eventId]: false }));
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">My Registrations</h4>
          <small className="text-muted">Events you have signed up for</small>
        </div>
        <Badge bg="secondary" className="fs-6">
          {registrations.length} registered
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-1">You haven't registered for any events yet.</p>
          <small>
            Head to <a href="/dashboard">Browse Events</a> to find something
            interesting.
          </small>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {registrations.map(({ event, createdAt }) => {
            const busy = !!actionLoading[event.id];
            return (
              <Col key={event.id}>
                <EventCard
                  event={event}
                  actionSlot={
                    <div className="d-flex flex-column gap-1 w-100">
                      <small className="text-muted">
                        Registered {new Date(createdAt).toLocaleDateString()}
                      </small>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleCancel(event.id)}
                        disabled={busy}
                      >
                        {busy ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Cancel Registration"
                        )}
                      </Button>
                    </div>
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
