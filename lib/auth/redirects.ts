import type { UserRole } from "@/types/domain";

const dashboardByRole: Record<UserRole, string> = {
  super_admin: "/dashboard",
  coach: "/dashboard",
  student: "/dashboard"
};

export function getDashboardPathByRole(role: UserRole) {
  return dashboardByRole[role];
}

export function isUserRole(role: string): role is UserRole {
  return role === "super_admin" || role === "coach" || role === "student";
}
