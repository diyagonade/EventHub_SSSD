import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const SSEContext = createContext(null);

/**
 * Opens a single SSE connection per authenticated session.
 * Consumers call subscribe(eventName, handler) to receive events.
 * The connection is opened when user logs in and closed on logout.
 */
export function SSEProvider({ children }) {
  const { user } = useAuth();
  // { [eventName]: Set<handler> }
  const listenersRef = useRef({});

  // Stable subscribe function — never changes reference
  const subscribe = useCallback((eventName, handler) => {
    if (!listenersRef.current[eventName]) {
      listenersRef.current[eventName] = new Set();
    }
    listenersRef.current[eventName].add(handler);
    return () => listenersRef.current[eventName]?.delete(handler);
  }, []);

  useEffect(() => {
    if (!user) return;

    const es = new EventSource("http://localhost:4000/api/events/stream", {
      withCredentials: true,
    });

    const dispatch = (eventName) => (e) => {
      try {
        const data = JSON.parse(e.data);
        listenersRef.current[eventName]?.forEach((fn) => fn(data));
      } catch {
        // ignore malformed messages
      }
    };

    es.addEventListener("registration_update", dispatch("registration_update"));
    es.addEventListener("new_notification", dispatch("new_notification"));

    return () => es.close();
  }, [user]);

  return (
    <SSEContext.Provider value={{ subscribe }}>{children}</SSEContext.Provider>
  );
}

export const useSSE = () => useContext(SSEContext);
