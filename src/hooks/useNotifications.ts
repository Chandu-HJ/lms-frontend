import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from '../api/notification.service';
import { type NotificationItem, type NotificationSocketPayload } from '../interfaces/notification.types';

const WS_URL = 'http://localhost:8080/ws-lms';

const buildSocketNotification = (payload: NotificationSocketPayload): NotificationItem => ({
  id: payload.id,
  message: payload.message,
  eventType: payload.eventType,
  referenceId: payload.referenceId,
  createdAt: new Date().toISOString(),
  read: false,
});

export const useNotificationState = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const refreshInFlightRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    const list = await getNotifications();
    setNotifications(list);
  }, []);

  const loadUnreadCount = useCallback(async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  }, []);

  const refreshNotifications = useCallback(async (showLoader = true) => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    if (showLoader) {
      setLoading(true);
    }
    try {
      await Promise.all([loadNotifications(), loadUnreadCount()]);
    } finally {
      refreshInFlightRef.current = false;
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [loadNotifications, loadUnreadCount]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    if (unreadIds.length === 0) return;

    await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)));
    setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    void refreshNotifications(true);
  }, [refreshNotifications]);


  // handshake process
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(WS_URL, undefined, {
          withCredentials: true,
        } as any),
      reconnectDelay: 5000,
      debug: () => undefined,
    });

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };

    client.onWebSocketError = (event) => {
      setIsSocketConnected(false);
      console.error('WebSocket error:', event);
    };

    client.onConnect = () => {
      setIsSocketConnected(true);
      client.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body) as NotificationSocketPayload;
          const newNotification = buildSocketNotification(payload);
          setNotifications((prev) => {
            if (prev.some((item) => item.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
        } catch {
          void refreshNotifications();
        }
      });
    };

    client.onDisconnect = () => {
      setIsSocketConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      const activeClient = clientRef.current;
      clientRef.current = null;
      if (activeClient) {
        void activeClient.deactivate();
      }
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (isSocketConnected) return;

    const intervalId = window.setInterval(() => {
      void refreshNotifications(false);
    }, 5000);

    const onFocus = () => {
      void refreshNotifications(false);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [isSocketConnected, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
};
