import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getEvent } from "../api/eventsApi";
import {
  cancelRegistration,
  getMyRegistrations,
  registerForEvent,
} from "../api/registrationsApi";
import { useAuth } from "../context/AuthContext";
import {
  CalendarEventFill,
  GeoAltFill,
  PeopleFill,
} from "react-bootstrap-icons";
import { useRegistrationStream } from "../hooks/useRegistrationStream";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useRegistrationStream(({ eventId, count }) => {
    if (eventId === id) {
      console.log({ count });
      setEvent((e) => (e ? { ...e, _count: { registrations: count } } : e));
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, regsRes] = await Promise.all([
          getEvent(id),
          user?.role === "USER"
            ? getMyRegistrations()
            : Promise.resolve({ data: { registrations: [] } }),
        ]);
        setEvent(eventRes.data.event);
        setIsRegistered(
          regsRes.data.registrations.some((r) => r.event.id === id),
        );
      } catch {
        toast.error("Failed to load event");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await registerForEvent(id);
      setIsRegistered(true);
      // setEvent((e) => ({
      //   ...e,
      //   _count: { registrations: e._count.registrations + 1 },
      // }));
      toast.success("Registered successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelRegistration(id);
      setIsRegistered(false);
      // setEvent((e) => ({
      //   ...e,
      //   _count: { registrations: e._count.registrations - 1 },
      // }));
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = event.capacity - event._count.registrations;
  const isFull = spotsLeft <= 0;

  return (
    <Container style={{ maxWidth: 720 }}>
      <Button
        variant="link"
        className="ps-0 mb-3 text-decoration-none"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h4 className="fw-bold mb-0">{event.title}</h4>
            {isFull ? (
              <Badge bg="danger">Sold Out</Badge>
            ) : (
              <Badge bg="success">{spotsLeft} spots left</Badge>
            )}
          </div>

          <p className="text-muted">{event.description}</p>

          <Row className="g-2 mb-4">
            <Col xs={12} sm={6}>
              <div className="d-flex align-items-center gap-2 text-muted">
                <CalendarEventFill />
                <span>{new Date(event.date).toLocaleString()}</span>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="d-flex align-items-center gap-2 text-muted">
                <PeopleFill />
                <span>
                  {event._count.registrations} / {event.capacity} registered
                </span>
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex align-items-center gap-2 text-muted">
                <GeoAltFill />
                <span>Organizer: {event.organizer?.email}</span>
              </div>
            </Col>
          </Row>

          {user?.role === "USER" && (
            <>
              {isRegistered ? (
                <Alert
                  variant="success"
                  className="d-flex justify-content-between align-items-center mb-0"
                >
                  <span>✅ You are registered for this event.</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      "Cancel Registration"
                    )}
                  </Button>
                </Alert>
              ) : (
                <Button
                  variant="primary"
                  disabled={isFull || actionLoading}
                  onClick={handleRegister}
                >
                  {actionLoading ? (
                    <Spinner size="sm" animation="border" />
                  ) : isFull ? (
                    "Event Full"
                  ) : (
                    "Register for Event"
                  )}
                </Button>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
