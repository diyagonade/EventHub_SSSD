import { useEffect, useRef } from "react";
import { useSSE } from "../context/SSEContext";

/**
 * Subscribes to new_notification SSE events for the current user.
 * Calls onNotification(notification) whenever the server pushes one.
 */
export function useNotificationStream(onNotification) {
  const { subscribe } = useSSE();
  const cbRef = useRef(onNotification);
  useEffect(() => {
    cbRef.current = onNotification;
  });
  useEffect(
    () => subscribe("new_notification", (data) => cbRef.current(data)),
    [subscribe],
  );
}
