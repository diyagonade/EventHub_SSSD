import { Container, Nav, Navbar as BsNavbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { toast } from "react-toastify";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <BsNavbar bg="primary" variant="dark" expand="md" className="mb-4 px-2">
      <Container fluid>
        <BsNavbar.Brand
          as={Link}
          to={user?.role === "ORGANIZER" ? "/organizer" : "/dashboard"}
        >
          🗓 EventHub
        </BsNavbar.Brand>
        <BsNavbar.Toggle />
        <BsNavbar.Collapse>
          {user && (
            <>
              <Nav className="me-auto">
                {user.role === "ORGANIZER" ? (
                  <>
                    <Nav.Link as={Link} to="/organizer">
                      My Events
                    </Nav.Link>
                    <Nav.Link as={Link} to="/organizer/events/create">
                      + New Event
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/dashboard">
                      Browse Events
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-registrations">
                      My Registrations
                    </Nav.Link>
                  </>
                )}
              </Nav>
              <Nav className="align-items-center gap-3">
                <NotificationBell />
                <span className="text-white-50 small d-none d-md-inline">
                  {user.email}
                </span>
                <Button
                  size="sm"
                  variant="outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Nav>
            </>
          )}
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
