import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteEvent, getMyEvents } from "../api/eventsApi";
import {
  PencilFill,
  TrashFill,
  PlusLg,
  PeopleFill,
  CalendarEventFill,
} from "react-bootstrap-icons";
import { useRegistrationStream } from "../hooks/useRegistrationStream";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useRegistrationStream(({ eventId, count }) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, _count: { registrations: count } } : e,
      ),
    );
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getMyEvents();
      setEvents(res.data.events);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">My Events</h4>
          <span className="text-muted small">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/organizer/events/create")}
        >
          <PlusLg className="me-1" /> New Event
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <p className="text-muted mb-3">
              You haven&apos;t created any events yet.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/organizer/events/create")}
            >
              Create your first event
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="d-md-none">
            <Row xs={1} className="g-3">
              {events.map((event) => {
                const spotsLeft = event.capacity - event._count.registrations;
                const isFull = spotsLeft <= 0;
                return (
                  <Col key={event.id}>
                    <Card className="shadow-sm">
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <Card.Title className="fs-6 mb-1">
                            {event.title}
                          </Card.Title>
                          {isFull ? (
                            <Badge bg="danger">Full</Badge>
                          ) : (
                            <Badge bg="success">{spotsLeft} left</Badge>
                          )}
                        </div>
                        <div className="text-muted small mb-2">
                          <CalendarEventFill className="me-1" />
                          {new Date(event.date).toLocaleDateString()}
                          <span className="ms-3">
                            <PeopleFill className="me-1" />
                            {event._count.registrations}/{event.capacity}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate(`/organizer/events/${event.id}/edit`)
                            }
                          >
                            <PencilFill /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => setDeleteTarget(event)}
                          >
                            <TrashFill /> Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Desktop: table */}
          <div className="d-none d-md-block">
            <Card className="shadow-sm">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Registrations</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const spotsLeft =
                      event.capacity - event._count.registrations;
                    const isFull = spotsLeft <= 0;
                    return (
                      <tr key={event.id}>
                        <td className="fw-medium">{event.title}</td>
                        <td className="text-muted">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td>
                          <span>{event._count.registrations}</span>
                          <span className="text-muted">/{event.capacity}</span>
                        </td>
                        <td>
                          {isFull ? (
                            <Badge bg="danger">Full</Badge>
                          ) : (
                            <Badge bg="success">{spotsLeft} left</Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() =>
                              navigate(`/organizer/events/${event.id}/edit`)
                            }
                          >
                            <PencilFill />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => setDeleteTarget(event)}
                          >
                            <TrashFill />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      <Modal
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete{" "}
            <strong>&quot;{deleteTarget?.title}&quot;</strong>?
          </p>
          <p className="text-muted small mb-0">
            All registrations will be cancelled and registered attendees will be
            notified.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
