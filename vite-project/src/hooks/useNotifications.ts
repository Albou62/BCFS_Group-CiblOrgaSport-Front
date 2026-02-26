// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../services/notificationService';

export const useGroups = (token: string) => {
  const [groups, setGroups] = useState<notificationService.Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchGroups(token);
      setGroups(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return { groups, loading, error, reload: loadGroups };
};

export const useSubscriptions = (token: string, userId: number) => {
  const [subscriptions, setSubscriptions] = useState<notificationService.Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchUserSubscriptions(token, userId);
      setSubscriptions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const subscribe = async (groupId: number) => {
    try {
      await notificationService.subscribeToGroup(token, userId, groupId);
      await loadSubscriptions(); // recharger
    } catch (err: any) {
      setError(err.message);
    }
  };

  const unsubscribe = async (groupId: number) => {
    try {
      await notificationService.unsubscribeFromGroup(token, userId, groupId);
      await loadSubscriptions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { subscriptions, loading, error, subscribe, unsubscribe, reload: loadSubscriptions };
};

export const useNotifications = (token: string, userId: number) => {
  const [notifications, setNotifications] = useState<notificationService.Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchUserNotifications(token, userId);
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const send = async (groupId: number, label: string, impactLevel: string) => {
    try {
      await notificationService.sendNotification(token, groupId, label, impactLevel);
      // Pas de rechargement ici car la notification est pour d'autres utilisateurs
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { notifications, loading, error, send, reload: loadNotifications };
};