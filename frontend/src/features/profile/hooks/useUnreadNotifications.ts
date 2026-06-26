import { useEffect, useState } from "react";
import type { Notification } from "../data/notifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function useUnreadNotifications(profileId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadCount() {
      if (!profileId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/users/${profileId}/notifications`);
        const payload = await response.json();

        if (!response.ok) return;

        const notifications = (payload.data ?? []) as Notification[];
        if (isMounted) {
          setUnreadCount(notifications.filter((notification) => !notification.isRead).length);
        }
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    }

    loadUnreadCount();
    const intervalId = window.setInterval(loadUnreadCount, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [profileId]);

  return unreadCount;
}

