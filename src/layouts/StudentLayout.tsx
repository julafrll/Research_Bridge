import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatedOutlet } from '@/components/PageTransition';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Inbox,
  Microscope,
  Megaphone,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Trophy,
} from 'lucide-react';
import { FEATURES } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { initials } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogo } from '@/components/BrandLogo';


interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const allNavItems: (NavItem & { video?: boolean })[] = [
  { label: 'My Competition Entry', path: '/competition', icon: Trophy },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, video: true },
  { label: 'Research Bridge Program', path: '/learn', icon: GraduationCap, video: true },
  { label: 'Assignments', path: '/assignments', icon: FileText, video: true },
  { label: 'My Submissions', path: '/my-submissions', icon: Inbox, video: true },
  { label: 'Research Hub', path: '/research-hub', icon: Microscope },
  { label: 'Announcements', path: '/announcements', icon: Megaphone },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Profile', path: '/profile', icon: User },
];

const navItems: NavItem[] = allNavItems.filter((i) => FEATURES.videos || !i.video);

export function StudentLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-muted-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-muted-200 bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-muted-200 px-6">
          <BrandLogo size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-muted-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm font-medium text-navy-700">
              {initials(profile?.full_name || 'Student')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-navy-900">
                {profile?.full_name || 'Student'}
              </p>
              <p className="truncate text-xs text-muted-400">Student</p>
            </div>
            <ThemeToggle className="p-1.5 text-muted-500" />
            <button
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-muted-400 transition-colors hover:bg-muted-100 hover:text-navy-700"
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
            className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface shadow-elevated animate-slide-down">
            <div className="flex h-16 items-center justify-between border-b border-muted-200 px-6">
              <BrandLogo size="sm" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-muted-400 hover:bg-muted-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-4" onClick={() => setSidebarOpen(false)}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-muted-200 p-3">
              <button
                onClick={handleSignOut}
                className="nav-link w-full"
              >
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-muted-200 bg-surface/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-navy-600 hover:bg-muted-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo size="sm" />
          <div className="flex items-center">
          <ThemeToggle />
          <Link to="/notifications" className="relative rounded-lg p-2 text-navy-600 hover:bg-muted-100">
            <Bell className="h-5 w-5" />
          </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  );
}
