import React from "react";
import {
  Building2,
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Video,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function FloatingSidebar() {
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-72 flex flex-col rounded-[2rem] bg-card/80 backdrop-blur-xl border border-border shadow-2xl overflow-hidden z-50">
      {/* Header / Branding */}
      <div className="p-6 pb-4 flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-muted border border-border shadow-inner">
          <Building2 className="w-6 h-6 text-foreground stroke-[1.5]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-foreground font-semibold text-lg leading-tight tracking-wide">
            FacilityOS
          </h1>
          <span className="text-muted-foreground text-sm font-medium">
            Management Suite
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {/* MAIN Section */}
        <div className="mb-6">
          <h2 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            Main
          </h2>
          <nav className="flex flex-col gap-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <LayoutDashboard className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Dashboard</span>
            </a>
            {/* Active Link */}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-primary text-primary-foreground transition-all duration-200 shadow-sm group"
            >
              <CheckSquare className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Tasks</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <MessageSquare className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Complaints</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <Video className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Conference</span>
            </a>
          </nav>
        </div>

        {/* MANAGEMENT Section */}
        <div className="mb-4">
          <h2 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            Management
          </h2>
          <nav className="flex flex-col gap-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <Users className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Manage Staff</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <BarChart3 className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Analytics</span>
            </a>
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-border">
        <button className="w-full flex items-center justify-between p-3 rounded-[1.5rem] bg-background hover:bg-muted border border-border transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-inner">
              <span className="text-primary-foreground font-semibold text-sm">I</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-foreground font-medium text-sm leading-none mb-1">
                inder
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                Local Admin
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-card transition-colors duration-200">
            <LogOut className="w-4 h-4" />
          </div>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--muted);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: var(--border);
        }
      `}} />
    </aside>
  );
}
