// services/notificationService.ts
const API_URL = import.meta.env.VITE_API_URL;

// Helper pour les en-têtes avec authentification
const authHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Types
export interface Group {
  GroupID: number;
  GroupName: string;
}

export interface Subscription {
  GroupID: number;
  GroupName: string;
  SubscriptionDate: string;
}

export interface Notification {
  ID: number;
  Date: string;
  Group: string;
  Label: string;
  ImpactLevel: string;
  read?: boolean; // Optionnel pour le marquage côté client
}

// --- Groupes ---
export const fetchGroups = async (token: string): Promise<Group[]> => {
  const res = await fetch(`${API_URL}/groups`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur lors du chargement des groupes');
  return res.json();
};

export const createGroup = async (token: string, name: string): Promise<void> => {
  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du groupe');
};

// --- Abonnements ---
export const fetchUserSubscriptions = async (token: string, userId: number): Promise<Subscription[]> => {
  const res = await fetch(`${API_URL}/subscription?UserID=${userId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur lors du chargement des abonnements');
  return res.json();
};

export const subscribeToGroup = async (token: string, userId: number, groupId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/subscription`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ UserID: userId, GroupID: groupId }),
  });
  if (!res.ok) throw new Error("Erreur lors de l'abonnement");
};

export const unsubscribeFromGroup = async (token: string, userId: number, groupId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/subscription`, {
    method: 'DELETE',
    headers: authHeaders(token),
    body: JSON.stringify({ UserID: userId, GroupID: groupId }),
  });
  if (!res.ok) throw new Error('Erreur lors du désabonnement');
};

// --- Notifications ---
export const fetchUserNotifications = async (token: string, userId: number): Promise<Notification[]> => {
  const res = await fetch(`${API_URL}/notification?UserID=${userId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur lors du chargement des notifications');
  return res.json();
};

export const sendNotification = async (
  token: string,
  groupId: number,
  label: string,
  impactLevel: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/notification`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ GroupID: groupId, Label: label, ImpactLevel: impactLevel }),
  });
  if (!res.ok) throw new Error('Erreur lors de l’envoi de la notification');
};