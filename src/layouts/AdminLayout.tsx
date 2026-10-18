import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Inbox,
  Microscope,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { initials } from '@/lib/utils';
import { BrandLogo } from '@/components/BrandLogo';


interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Courses & Lessons', path: '/admin/courses', icon: BookOpen },
  { label: 'Assignments', path: '/admin/assignments', icon: FileText },
  { label: 'Submissions', path: '/admin/submissions', icon: Inbox },
  { label: 'Research Hub', path: '/admin/research-hub', icon: Microscope },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex min-h-screen bg-muted-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-muted-200 bg-navy-900 lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-navy-800 px-6">
          <BrandLogo variant="light" size="sm" />
        </div>
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-blue-300" />
            <span className="text-xs font-medium text-blue-200">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-white text-navy-900'
                  : 'text-navy-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-navy-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
              {initials(profile?.full_name || 'Admin')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="truncate text-xs text-navy-400">Administrator</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-navy-900 shadow-elevated animate-slide-down">
            <div className="flex h-16 items-center justify-between border-b border-navy-800 px-6">
              <BrandLogo variant="light" size="sm" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-navy-400 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-3" onClick={() => setSidebarOpen(false)}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-white text-navy-900'
                      : 'text-navy-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-navy-800 p-3">
              <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-white/10 hover:text-white">
                <LogOut className="h-[18px] w-[18px]" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-muted-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-navy-600 hover:bg-muted-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo href="/admin" size="sm" />
          <div className="w-9" />
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
