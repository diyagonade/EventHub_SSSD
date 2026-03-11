import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getEvent, updateEvent } from "../api/eventsApi";

function toDatetimeLocal(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    capacity: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEvent(id)
      .then((res) => {
        const e = res.data.event;
        setForm({
          title: e.title,
          description: e.description,
          date: toDatetimeLocal(e.date),
          capacity: String(e.capacity),
        });
      })
      .catch(() => {
        toast.error("Event not found");
        navigate("/organizer");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateEvent(id, form);
      toast.success("Event updated!");
      navigate("/organizer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
          <h5 className="fw-bold mb-4">Edit Event</h5>
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
                    min={1}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
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
