import { listUsers as listUsersApi, updateUserRole as updateUserRoleApi } from './userService';

export function listUsers(token) {
  return listUsersApi(token);
}

export function updateUserRole(token, userId, role) {
  return updateUserRoleApi(token, userId, role);
}
