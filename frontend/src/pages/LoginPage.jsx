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
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.email}!`);
      navigate(user.role === "ORGANIZER" ? "/organizer" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
            <p className="text-center text-muted mb-4">
              Sign in to your account
            </p>
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
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
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
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Form>
            <p className="text-center mt-3 mb-0 small text-muted">
              Don&apos;t have an account? <Link to="/register">Sign up</Link>
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}
