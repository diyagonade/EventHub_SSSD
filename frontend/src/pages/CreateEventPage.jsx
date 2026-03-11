import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createEvent } from "../api/eventsApi";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    capacity: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createEvent(form);
      toast.success("Event created!");
      navigate("/organizer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: 640 }}>
      <Button
        variant="link"
        className="ps-0 mb-3 text-decoration-none"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4">Create New Event</h5>
          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Tech Summit 2026"
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event…"
                required
              />
            </Form.Group>
            <Row className="g-3 mb-4">
              <Col sm={7}>
                <Form.Group>
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="date"
                    min={new Date().toISOString().slice(0, 16)}
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={5}>
                <Form.Group>
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    min={1}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Creating…" : "Create Event"}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
