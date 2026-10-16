import { Role } from "../enums/role.enum";


/**
 * Centralized permission identifiers.
 * Keep these identifiers consistent across backend and frontend.
 */
export const PERMISSION = {
  // Inquiries
  INQUIRY_CREATE: "INQUIRY_CREATE",
  INQUIRY_READ: "INQUIRY_READ",
  INQUIRY_STATUS_UPDATE: "INQUIRY_STATUS_UPDATE",
  INQUIRY_ASSIGN: "INQUIRY_ASSIGN",
  INQUIRY_CONVERT: "INQUIRY_CONVERT",
  INQUIRY_DELETE: "INQUIRY_DELETE",

  // Users
  USER_READ: "USER_READ",
  USER_UPDATE: "USER_UPDATE",
  USER_ACTIVATE: "USER_ACTIVATE",
  USER_DEACTIVATE: "USER_DEACTIVATE",
  USER_DELETE: "USER_DELETE",

  // Employees
  EMPLOYEE_READ: "EMPLOYEE_READ",
  EMPLOYEE_UPDATE: "EMPLOYEE_UPDATE",
  EMPLOYEE_APPROVE: "EMPLOYEE_APPROVE",
  EMPLOYEE_REJECT: "EMPLOYEE_REJECT",
  EMPLOYEE_TASKS_READ: "EMPLOYEE_TASKS_READ",

  // Clients
  CLIENT_READ: "CLIENT_READ",
  CLIENT_SITES_READ: "CLIENT_SITES_READ",

  // Sites
  SITE_READ: "SITE_READ",
  SITE_CREATE: "SITE_CREATE",
  SITE_UPDATE: "SITE_UPDATE",
  SITE_DELETE: "SITE_DELETE",
  SITE_PROGRESS_READ: "SITE_PROGRESS_READ",
  SITE_TASKS_READ: "SITE_TASKS_READ",
  SITE_FLOOR_PLANS_READ: "SITE_FLOOR_PLANS_READ",

  // Tasks
  TASK_READ: "TASK_READ",
  TASK_CREATE: "TASK_CREATE",
  TASK_UPDATE: "TASK_UPDATE",
  TASK_STATUS_UPDATE: "TASK_STATUS_UPDATE",
  TASK_DELETE: "TASK_DELETE",

  // Floor Plans
  FLOOR_PLAN_READ: "FLOOR_PLAN_READ",
  FLOOR_PLAN_CREATE: "FLOOR_PLAN_CREATE",
  FLOOR_PLAN_UPDATE: "FLOOR_PLAN_UPDATE",
  FLOOR_PLAN_APPROVE: "FLOOR_PLAN_APPROVE",
  FLOOR_PLAN_REJECT: "FLOOR_PLAN_REJECT",
  FLOOR_PLAN_DELETE: "FLOOR_PLAN_DELETE",

  // Maps
  MAP_READ: "MAP_READ",
  MAP_NEARBY_READ: "MAP_NEARBY_READ",
  MAP_CITY_SUMMARY_READ: "MAP_CITY_SUMMARY_READ",
} as const;

export type Permission =
  (typeof PERMISSION)[keyof typeof PERMISSION];

/**
 * Menu item returned to the frontend.
 */
export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: string;
  permissions: Permission[];
}

/**
 * Access configuration for each role.
 */
export interface RoleAccessConfig {
  permissions: Permission[];
  menus: MenuItem[];
}

/**
 * ADMIN permissions.
 */
const ADMIN_PERMISSIONS: Permission[] = [
  // Inquiries
  PERMISSION.INQUIRY_READ,
  PERMISSION.INQUIRY_STATUS_UPDATE,
  PERMISSION.INQUIRY_ASSIGN,
  PERMISSION.INQUIRY_CONVERT,
  PERMISSION.INQUIRY_DELETE,

  // Users
  PERMISSION.USER_READ,
  PERMISSION.USER_UPDATE,
  PERMISSION.USER_ACTIVATE,
  PERMISSION.USER_DEACTIVATE,
  PERMISSION.USER_DELETE,

  // Employees
  PERMISSION.EMPLOYEE_READ,
  PERMISSION.EMPLOYEE_UPDATE,
  PERMISSION.EMPLOYEE_APPROVE,
  PERMISSION.EMPLOYEE_REJECT,
  PERMISSION.EMPLOYEE_TASKS_READ,

  // Clients
  PERMISSION.CLIENT_READ,
  PERMISSION.CLIENT_SITES_READ,

  // Sites
  PERMISSION.SITE_READ,
  PERMISSION.SITE_CREATE,
  PERMISSION.SITE_UPDATE,
  PERMISSION.SITE_DELETE,
  PERMISSION.SITE_PROGRESS_READ,
  PERMISSION.SITE_TASKS_READ,
  PERMISSION.SITE_FLOOR_PLANS_READ,

  // Tasks
  PERMISSION.TASK_READ,
  PERMISSION.TASK_CREATE,
  PERMISSION.TASK_UPDATE,
  PERMISSION.TASK_STATUS_UPDATE,
  PERMISSION.TASK_DELETE,

  // Floor Plans
  PERMISSION.FLOOR_PLAN_READ,
  PERMISSION.FLOOR_PLAN_CREATE,
  PERMISSION.FLOOR_PLAN_UPDATE,
  PERMISSION.FLOOR_PLAN_DELETE,

  // Maps
  PERMISSION.MAP_READ,
  PERMISSION.MAP_NEARBY_READ,
  PERMISSION.MAP_CITY_SUMMARY_READ,
];

/**
 * EMPLOYEE permissions.
 * Task updates must be restricted to the assigned employee.
 */
const EMPLOYEE_PERMISSIONS: Permission[] = [
  PERMISSION.EMPLOYEE_TASKS_READ,

  PERMISSION.SITE_READ,
  PERMISSION.SITE_TASKS_READ,
  PERMISSION.SITE_FLOOR_PLANS_READ,

  PERMISSION.TASK_READ,
  PERMISSION.TASK_UPDATE,
  PERMISSION.TASK_STATUS_UPDATE,

  PERMISSION.FLOOR_PLAN_READ,

  PERMISSION.MAP_READ,
  PERMISSION.MAP_NEARBY_READ,
];

/**
 * CLIENT permissions.
 * Site and floor-plan access must be restricted to owned sites.
 */
const CLIENT_PERMISSIONS: Permission[] = [
  PERMISSION.CLIENT_SITES_READ,

  PERMISSION.SITE_READ,
  PERMISSION.SITE_PROGRESS_READ,
  PERMISSION.SITE_TASKS_READ,
  PERMISSION.SITE_FLOOR_PLANS_READ,

  PERMISSION.TASK_READ,

  PERMISSION.FLOOR_PLAN_READ,
  PERMISSION.FLOOR_PLAN_APPROVE,
  PERMISSION.FLOOR_PLAN_REJECT,

  PERMISSION.MAP_READ,
  PERMISSION.MAP_NEARBY_READ,
];

/**
 * Centralized role-wise menus and action permissions.
 */
export const ACCESS_CONTROL: Record<Role, RoleAccessConfig> = {
  [Role.ADMIN]: {
    permissions: ADMIN_PERMISSIONS,

    menus: [
      {
        key: "inquiries",
        label: "Inquiries",
        path: "/admin/inquiries",
        icon: "inquiry",
        permissions: [
          PERMISSION.INQUIRY_READ,
          PERMISSION.INQUIRY_STATUS_UPDATE,
          PERMISSION.INQUIRY_ASSIGN,
          PERMISSION.INQUIRY_CONVERT,
          PERMISSION.INQUIRY_DELETE,
        ],
      },
      {
        key: "users",
        label: "Users",
        path: "/admin/users",
        icon: "users",
        permissions: [
          PERMISSION.USER_READ,
          PERMISSION.USER_UPDATE,
          PERMISSION.USER_ACTIVATE,
          PERMISSION.USER_DEACTIVATE,
          PERMISSION.USER_DELETE,
        ],
      },
      {
        key: "employees",
        label: "Employees",
        path: "/admin/employees",
        icon: "employees",
        permissions: [
          PERMISSION.EMPLOYEE_READ,
          PERMISSION.EMPLOYEE_UPDATE,
          PERMISSION.EMPLOYEE_APPROVE,
          PERMISSION.EMPLOYEE_REJECT,
          PERMISSION.EMPLOYEE_TASKS_READ,
        ],
      },
      {
        key: "clients",
        label: "Clients",
        path: "/admin/clients",
        icon: "clients",
        permissions: [
          PERMISSION.CLIENT_READ,
          PERMISSION.CLIENT_SITES_READ,
        ],
      },
      {
        key: "sites",
        label: "Sites",
        path: "/admin/sites",
        icon: "site",
        permissions: [
          PERMISSION.SITE_READ,
          PERMISSION.SITE_CREATE,
          PERMISSION.SITE_UPDATE,
          PERMISSION.SITE_DELETE,
          PERMISSION.SITE_PROGRESS_READ,
          PERMISSION.SITE_TASKS_READ,
          PERMISSION.SITE_FLOOR_PLANS_READ,
        ],
      },
      {
        key: "tasks",
        label: "Tasks",
        path: "/admin/tasks",
        icon: "task",
        permissions: [
          PERMISSION.TASK_READ,
          PERMISSION.TASK_CREATE,
          PERMISSION.TASK_UPDATE,
          PERMISSION.TASK_STATUS_UPDATE,
          PERMISSION.TASK_DELETE,
        ],
      },
      {
        key: "floor-plans",
        label: "Floor Plans",
        path: "/admin/floor-plans",
        icon: "floor-plan",
        permissions: [
          PERMISSION.FLOOR_PLAN_READ,
          PERMISSION.FLOOR_PLAN_CREATE,
          PERMISSION.FLOOR_PLAN_UPDATE,
          PERMISSION.FLOOR_PLAN_DELETE,
        ],
      },
      {
        key: "maps",
        label: "Maps",
        path: "/admin/maps",
        icon: "map",
        permissions: [
          PERMISSION.MAP_READ,
          PERMISSION.MAP_NEARBY_READ,
          PERMISSION.MAP_CITY_SUMMARY_READ,
        ],
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
        permissions: [
          PERMISSION.TASK_READ,
          PERMISSION.TASK_UPDATE,
          PERMISSION.TASK_STATUS_UPDATE,
        ],
      },
      {
        key: "sites",
        label: "Sites",
        path: "/employee/sites",
        icon: "site",
        permissions: [
          PERMISSION.SITE_READ,
          PERMISSION.SITE_TASKS_READ,
          PERMISSION.SITE_FLOOR_PLANS_READ,
        ],
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
        permissions: [
          PERMISSION.MAP_READ,
          PERMISSION.MAP_NEARBY_READ,
        ],
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
        permissions: [
          PERMISSION.SITE_READ,
          PERMISSION.SITE_PROGRESS_READ,
          PERMISSION.SITE_TASKS_READ,
          PERMISSION.SITE_FLOOR_PLANS_READ,
        ],
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
        permissions: [
          PERMISSION.FLOOR_PLAN_READ,
          PERMISSION.FLOOR_PLAN_APPROVE,
          PERMISSION.FLOOR_PLAN_REJECT,
        ],
      },
      {
        key: "maps",
        label: "Maps",
        path: "/client/maps",
        icon: "map",
        permissions: [
          PERMISSION.MAP_READ,
          PERMISSION.MAP_NEARBY_READ,
        ],
      },
    ],
  },
};

/**
 * Get complete access configuration for a role.
 */
export const getAccessControlByRole = (
  role: Role,
): RoleAccessConfig | undefined => {
  return ACCESS_CONTROL[role];
};

/**
 * Check whether a role has a permission.
 */
export const hasPermission = (
  role: Role,
  permission: Permission,
): boolean => {
  return ACCESS_CONTROL[role]?.permissions.includes(permission) ?? false;
};

/**
 * Return menus with only the permissions granted to that role.
 */
export const getMenusByRole = (role: Role): MenuItem[] => {
  const access = ACCESS_CONTROL[role];

  if (!access) {
    return [];
  }

  return access.menus
    .map((menu) => ({
      ...menu,
      permissions: menu.permissions.filter((permission) =>
        access.permissions.includes(permission),
      ),
    }))
    .filter((menu) => menu.permissions.length > 0);
};
