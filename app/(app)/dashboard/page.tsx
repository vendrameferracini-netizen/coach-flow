import { CoachDashboard } from "@/features/dashboard/coach-dashboard";
import { StudentDashboard } from "@/features/dashboard/student-dashboard";
import { SuperAdminDashboard } from "@/features/dashboard/super-admin-dashboard";
import { getAppSession } from "@/lib/auth/session";
import { getRealCoachDashboard, getRealStudentDashboard, getRealSuperAdminDashboard } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import {
  demoAssessments,
  demoDiets,
  demoMessages,
  demoProfiles,
  demoProtocols,
  demoStudents,
  demoWorkouts,
  getCoachDashboard
} from "@/lib/data/demo";

export default async function DashboardPage() {
  const { profile, isDemo } = await getAppSession(["super_admin", "coach", "student"]);

  if (!isDemo && profile.role === "super_admin") {
    const data = await getRealSuperAdminDashboard();
    return <SuperAdminDashboard coaches={data.coaches} students={data.students} />;
  }

  if (!isDemo && profile.role === "student") {
    const data = await getRealStudentDashboard(profile);
    if (!data.student) {
      return <div className="rounded-lg border border-line bg-white p-6 text-sm font-semibold text-zinc-600 shadow-soft">Nenhum aluno vinculado a este usuário.</div>;
    }

    return (
      <StudentDashboard
        student={data.student}
        workouts={data.workouts}
        diets={data.diets}
        assessments={data.assessments}
        protocols={data.protocols}
        messages={data.messages}
      />
    );
  }

  if (!isDemo && profile.role === "coach") {
    return <CoachDashboard data={await getRealCoachDashboard(profile)} />;
  }

  if (profile.role === "super_admin") {
    return <SuperAdminDashboard coaches={demoProfiles.filter((item) => item.role === "coach")} students={demoStudents} />;
  }

  if (profile.role === "student") {
    const student = getDemoStudentForProfile(profile);
    return (
      <StudentDashboard
        student={student}
        workouts={demoWorkouts.filter((item) => item.studentId === student.id)}
        diets={demoDiets.filter((item) => item.studentId === student.id)}
        assessments={demoAssessments.filter((item) => item.studentId === student.id)}
        protocols={demoProtocols.filter((item) => item.studentId === student.id)}
        messages={demoMessages.filter((item) => item.studentId === student.id)}
      />
    );
  }

  return <CoachDashboard data={getCoachDashboard(getDemoCoachId(profile))} />;
}
