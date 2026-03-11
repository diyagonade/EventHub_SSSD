import { Badge, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PeopleFill, CalendarEventFill } from "react-bootstrap-icons";

export default function EventCard({ event, actionSlot }) {
  const navigate = useNavigate();
  const spotsLeft = event.capacity - (event._count?.registrations ?? 0);
  const isFull = spotsLeft <= 0;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Card.Title className="mb-0 fs-6 fw-semibold">
            {event.title}
          </Card.Title>
          {isFull ? (
            <Badge bg="danger">Full</Badge>
          ) : (
            <Badge bg="success">{spotsLeft} left</Badge>
          )}
        </div>
        <Card.Text
          className="text-muted small flex-grow-1"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {event.description}
        </Card.Text>
        <div className="d-flex flex-column gap-1 text-muted small mb-3">
          <span>
            <CalendarEventFill className="me-1" />
            {new Date(event.date).toLocaleString()}
          </span>
          <span>
            <PeopleFill className="me-1" />
            {event._count?.registrations ?? 0} / {event.capacity} registered
          </span>
          {event.organizer && (
            <span className="text-truncate">By: {event.organizer.email}</span>
          )}
        </div>
        <div className="d-flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            View Details
          </Button>
          {actionSlot}
        </div>
      </Card.Body>
    </Card>
  );
}
