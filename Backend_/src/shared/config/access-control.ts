import { Role } from "../enums";

export const PERMISSION = {
  // Inquiry
  INQUIRY_READ: "INQUIRY_READ",
  INQUIRY_CREATE: "INQUIRY_CREATE",
  INQUIRY_UPDATE: "INQUIRY_UPDATE",
  INQUIRY_DELETE: "INQUIRY_DELETE",

  // Task
  TASK_READ: "TASK_READ",
  TASK_CREATE: "TASK_CREATE",
  TASK_UPDATE: "TASK_UPDATE",
  TASK_DELETE: "TASK_DELETE",

  // Site
  SITE_READ: "SITE_READ",
  SITE_CREATE: "SITE_CREATE",
  SITE_UPDATE: "SITE_UPDATE",
  SITE_DELETE: "SITE_DELETE",

  // Floor Plan
  FLOOR_PLAN_READ: "FLOOR_PLAN_READ",
  FLOOR_PLAN_CREATE: "FLOOR_PLAN_CREATE",
  FLOOR_PLAN_UPDATE: "FLOOR_PLAN_UPDATE",
  FLOOR_PLAN_DELETE: "FLOOR_PLAN_DELETE",

  // Maps
  MAP_READ: "MAP_READ",
} as const;

export type Permission =
  (typeof PERMISSION)[keyof typeof PERMISSION];

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: string;
  permissions: Permission[];
}

interface RoleAccessConfig {
  permissions: Permission[];
  menus: MenuItem[];
}

const ADMIN_PERMISSIONS: Permission[] = [
  PERMISSION.INQUIRY_READ,
  PERMISSION.INQUIRY_CREATE,
  PERMISSION.INQUIRY_UPDATE,
  PERMISSION.INQUIRY_DELETE,

  PERMISSION.TASK_READ,
  PERMISSION.TASK_CREATE,
  PERMISSION.TASK_UPDATE,
  PERMISSION.TASK_DELETE,

  PERMISSION.SITE_READ,
  PERMISSION.SITE_CREATE,
  PERMISSION.SITE_UPDATE,
  PERMISSION.SITE_DELETE,

  PERMISSION.FLOOR_PLAN_READ,
  PERMISSION.FLOOR_PLAN_CREATE,
  PERMISSION.FLOOR_PLAN_UPDATE,
  PERMISSION.FLOOR_PLAN_DELETE,

  PERMISSION.MAP_READ,
];

const EMPLOYEE_PERMISSIONS: Permission[] = [
  PERMISSION.TASK_READ,
  PERMISSION.TASK_UPDATE,
  PERMISSION.SITE_READ,
  PERMISSION.FLOOR_PLAN_READ,
  PERMISSION.MAP_READ,
];

const CLIENT_PERMISSIONS: Permission[] = [
  PERMISSION.SITE_READ,
  PERMISSION.TASK_READ,
  PERMISSION.FLOOR_PLAN_READ,
  PERMISSION.MAP_READ,
];

export const ACCESS_CONTROL: Record<Role, RoleAccessConfig> = {
  [Role.ADMIN]: {
    permissions: ADMIN_PERMISSIONS,
    menus: [
      {
        key: "inquiries",
        label: "Inquiries",
        path: "/admin/inquiries",
        icon: "inquiry",
        permissions: [PERMISSION.INQUIRY_READ],
      },
      {
        key: "sites",
        label: "Sites",
        path: "/admin/sites",
        icon: "site",
        permissions: [PERMISSION.SITE_READ],
      },
      {
        key: "tasks",
        label: "Tasks",
        path: "/admin/tasks",
        icon: "task",
        permissions: [PERMISSION.TASK_READ],
      },
      {
        key: "floor-plans",
        label: "Floor Plans",
        path: "/admin/floor-plans",
        icon: "floor-plan",
        permissions: [PERMISSION.FLOOR_PLAN_READ],
      },
      {
        key: "maps",
        label: "Maps",
        path: "/admin/maps",
        icon: "map",
        permissions: [PERMISSION.MAP_READ],
      },
    ],
  },

  [Role.EMPLOYEE]: {
    permissions: EMPLOYEE_PERMISSIONS,
    menus: [
      {
        key: "my-tasks",
        label: "My Tasks",
        path: "/employee/my-tasks",
        icon: "task",
        permissions: [PERMISSION.TASK_READ],
      },
      {
        key: "sites",
        label: "Sites",
        path: "/employee/sites",
        icon: "site",
        permissions: [PERMISSION.SITE_READ],
      },
      {
        key: "floor-plans",
        label: "Floor Plans",
        path: "/employee/floor-plans",
        icon: "floor-plan",
        permissions: [PERMISSION.FLOOR_PLAN_READ],
      },
      {
        key: "maps",
        label: "Maps",
        path: "/employee/maps",
        icon: "map",
        permissions: [PERMISSION.MAP_READ],
      },
    ],
  },

  [Role.CLIENT]: {
    permissions: CLIENT_PERMISSIONS,
    menus: [
      {
        key: "my-sites",
        label: "My Sites",
        path: "/client/sites",
        icon: "site",
        permissions: [PERMISSION.SITE_READ],
      },
      {
        key: "tasks",
        label: "Tasks",
        path: "/client/tasks",
        icon: "task",
        permissions: [PERMISSION.TASK_READ],
      },
      {
        key: "floor-plans",
        label: "Floor Plans",
        path: "/client/floor-plans",
        icon: "floor-plan",
        permissions: [PERMISSION.FLOOR_PLAN_READ],
      },
      {
        key: "maps",
        label: "Maps",
        path: "/client/maps",
        icon: "map",
        permissions: [PERMISSION.MAP_READ],
      },
    ],
  },
};

/**
 * Returns the permissions and menus available to a role.
 */
export const getAccessControlByRole = (role: Role) => {
  return ACCESS_CONTROL[role];
};

/**
 * Checks whether a role has a specific permission.
 */
export const hasPermission = (
  role: Role,
  permission: Permission,
): boolean => {
  return ACCESS_CONTROL[role]?.permissions.includes(permission) ?? false;
};

/**
 * Returns only the menus allowed for a role.
 */
export const getMenusByRole = (role: Role): MenuItem[] => {
  const access = ACCESS_CONTROL[role];

  if (!access) {
    return [];
  }

  return access.menus.filter((menu) =>
    menu.permissions.every((permission) =>
      hasPermission(role, permission),
    ),
  );
};