import React from "react";
import { useSectionForm } from "../../hooks/useSectionForm";
import { SectionCard } from "../../components/SectionCard";
import { SectionForm } from "../../components/SectionForm";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/button";
import { BookOpen, Users, DollarSign, Plus, Calendar, ShieldAlert } from "lucide-react";

export default function TeacherDashboardPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const bookings = useAppStore((state) => state.bookings);

  // If not logged in or not a teacher, display access denied
  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You must be signed in as a Teacher to access this dashboard portal.
        </p>
        <Button onClick={() => (window.location.href = "/auth")} className="w-full">
          Go to Sign In
        </Button>
      </div>
    );
  }

  const {
    sections,
    editingId,
    values,
    setValues,
    startCreate,
    startEdit,
    cancel,
    submit,
  } = useSectionForm();

  // Calculate stats
  const activeSectionsCount = sections.length;
  const sectionIds = new Set(sections.map((s) => s.id));
  const relevantBookings = bookings.filter((b) => sectionIds.has(b.sectionId));
  const activeBookings = relevantBookings.filter((b) => b.status !== "failed");
  const totalSeatsBooked = activeBookings.length;
  const paidBookings = relevantBookings.filter((b) => b.status === "paid");

  const totalRevenue = paidBookings.reduce((sum, b) => {
    const section = sections.find((s) => s.id === b.sectionId);
    return sum + (section ? section.price : 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser.name}. Manage your courses and track student bookings.
          </p>
        </div>
        {editingId !== "new" && (
          <Button onClick={startCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 self-start sm:self-center font-semibold">
            <Plus className="size-4" />
            Create Section
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="flex items-center gap-4 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-400/15 dark:text-blue-400">
            <BookOpen className="size-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Active Sections</div>
            <div className="text-2xl font-bold mt-0.5">{activeSectionsCount}</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex items-center gap-4 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400">
            <Users className="size-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
            <div className="text-2xl font-bold mt-0.5">{totalSeatsBooked} students</div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex items-center gap-4 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/15 dark:text-emerald-400">
            <DollarSign className="size-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold mt-0.5">${totalRevenue}</div>
          </div>
        </div>
      </div>

      {/* Section Creation/Editing Form */}
      {editingId && (
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <SectionForm
            mode={editingId === "new" ? "new" : "edit"}
            values={values}
            onChange={setValues}
            onSubmit={submit}
            onCancel={cancel}
          />
        </div>
      )}

      {/* Main Grid: Course List & Booking Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Sections List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Your Posted Sections</h2>
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
              <BookOpen className="size-8 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-foreground">No sections created</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                You haven't posted any active learning sections yet.
              </p>
              <Button onClick={startCreate} variant="outline" size="sm">
                Create First Section
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section) => {
                const count = bookings.filter(
                  (b) => b.sectionId === section.id && b.status !== "failed"
                ).length;
                return (
                  <div key={section.id} className="relative group">
                    <SectionCard
                      section={section}
                      actionLabel="Edit Details"
                      onAction={() => startEdit(section)}
                      enrolledCount={count}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Student Bookings Roster */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Student Bookings</h2>
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
            {relevantBookings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No bookings registered yet.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-border/60">
                {relevantBookings.map((b, index) => {
                  const sect = sections.find((s) => s.id === b.sectionId);
                  return (
                    <div key={b.id} className={`flex items-start justify-between py-3 ${index === 0 ? 'pt-0' : ''}`}>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground truncate max-w-[150px]">
                          Student: {b.studentId}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          Class: {sect ? sect.title : b.sectionId}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(b.bookedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          b.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : b.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
