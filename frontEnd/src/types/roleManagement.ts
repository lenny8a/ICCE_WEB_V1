import React from 'react';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export interface Role {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Page {
  _id: string;
  name: string;
  path: string;
  description: string;
  isActive: boolean;
}

export enum ActionType {
  VIEW = "visualizar",
  MODIFY = "modificar",
  DELETE = "borrar",
  ACCOUNT = "contabilizar",
  CANCEL = "anular",
}

export interface Permission {
  _id: string;
  role: Role | string; 
  page: Page | string; 
  actions: ActionType[];
}

export const actionIcons: Record<ActionType, React.ReactNode> = {
  [ActionType.VIEW]: <Eye size={14} />,
  [ActionType.MODIFY]: <Edit size={14} />,
  [ActionType.DELETE]: <Trash2 size={14} />,
  [ActionType.ACCOUNT]: <CheckCircle size={14} />,
  [ActionType.CANCEL]: <XCircle size={14} />,
};

// Interfaz para el estado de UserFormData en UserManagement.tsx (si se decide moverla también)
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  roles: string[]; // Array of role IDs
}

// Interfaz para el estado de PasswordFormData en UserManagement.tsx (si se decide moverla también)
export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interfaz para UserInterface en UserManagement.tsx (si se decide moverla también)
// Nota: Esta interfaz ya existe en UserManagement.tsx y es exportada.
// Si se mueve aquí, UserManagement.tsx deberá importarla.
// Para evitar conflictos si UserManagement.tsx aún la exporta, la comentaré aquí por ahora.
/*
export interface UserInterface {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: Role[]; // Usa la interfaz Role definida arriba
}
*/
