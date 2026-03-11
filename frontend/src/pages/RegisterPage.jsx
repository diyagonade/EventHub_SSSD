import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const user = await register(form.email, form.password, role);
      toast.success("Account created! Welcome to EventHub.");
      navigate(user.role === "ORGANIZER" ? "/organizer" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Col xs={12} sm={9} md={6} lg={5}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h4 className="mb-1 fw-bold text-center">🗓 EventHub</h4>
            <p className="text-center text-muted mb-4">Create your account</p>

            {/* Role picker */}
            <div className="d-flex justify-content-center mb-4">
              <ToggleButtonGroup
                type="radio"
                name="role"
                value={role}
                onChange={setRole}
              >
                <ToggleButton
                  id="role-user"
                  value="USER"
                  variant="outline-primary"
                  size="sm"
                >
                  I&apos;m an Attendee
                </ToggleButton>
                <ToggleButton
                  id="role-organizer"
                  value="ORGANIZER"
                  variant="outline-secondary"
                  size="sm"
                >
                  I&apos;m an Organizer
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            {error && (
              <Alert variant="danger" className="py-2">
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading
                  ? "Creating account…"
                  : `Sign up as ${role === "ORGANIZER" ? "Organizer" : "Attendee"}`}
              </Button>
            </Form>
            <p className="text-center mt-3 mb-0 small text-muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}
