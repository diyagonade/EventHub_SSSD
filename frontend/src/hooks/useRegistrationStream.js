import { useEffect, useRef } from "react";
import { useSSE } from "../context/SSEContext";

/**
 * Subscribes to registration_update SSE events.
 * Calls onUpdate({ eventId, count }) whenever a registration count changes.
 */
export function useRegistrationStream(onUpdate) {
  const { subscribe } = useSSE();
  const cbRef = useRef(onUpdate);
  useEffect(() => {
    cbRef.current = onUpdate;
  });
  useEffect(
    () => subscribe("registration_update", (data) => cbRef.current(data)),
    [subscribe],
  );
}
