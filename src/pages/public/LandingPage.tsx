import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Award,
  Users,
  Microscope,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';

export function LandingPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const dashboardLink = user
    ? isAdmin
      ? '/admin'
      : '/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-muted-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(dashboardLink)}>
              {user ? 'Dashboard' : 'Sign In'}
            </Button>
            {!user && (
              <Button size="sm" onClick={() => navigate('/register')}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-slide-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5">
                <Microscope className="h-3.5 w-3.5 text-navy-600" />
                <span className="text-xs font-medium text-navy-700">
                  Research Education Platform
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight text-navy-900 md:text-5xl">
                From Curiosity
                <br />
                <span className="text-navy-600">to Discovery.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-600">
                A structured learning platform for aspiring researchers. Watch expert
                lessons, take quizzes, submit assignments, and receive personalized
                feedback from instructors.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/register')}>
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['A', 'K', 'M', 'S'].map((initial, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-navy-700 text-xs font-medium text-white"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-500">
                  Trusted by research students worldwide
                </p>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden md:block">
              <div className="rounded-2xl border border-navy-200 bg-white p-6 shadow-elevated">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/Research_Bridge_Logo-selection.png" alt="" className="h-10 w-10 rounded-full" />
                    <div className="h-3 w-3 rounded-full bg-error-300" />
                    <div className="h-3 w-3 rounded-full bg-warning-300" />
                    <div className="h-3 w-3 rounded-full bg-success-300" />
                  </div>
                  <span className="text-xs text-muted-400">Research Bridge</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-navy-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-navy-600" />
                      <span className="text-sm font-medium text-navy-900">
                        Research Methodology
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-navy-100">
                      <div className="h-2 w-3/4 rounded-full bg-navy-600" />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-500">75% Complete</p>
                  </div>
                  <div className="rounded-xl border border-muted-200 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-navy-900">
                        Lesson 4: Literature Reviews
                      </span>
                    </div>
                    <div className="relative h-20 overflow-hidden rounded-lg bg-gradient-to-br from-navy-700 to-navy-900">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-navy-950/40 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                        <Video className="h-2.5 w-2.5" />
                        12:34
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform">
                          <PlayCircle className="h-7 w-7 text-navy-700" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy-950/40">
                        <div className="h-full w-1/3 rounded-full bg-white/80" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-success-50 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-600" />
                      <span className="text-sm font-medium text-success-700">
                        Quiz Passed
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-success-700">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-muted-200 bg-muted-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-navy-900">
              Everything you need to master research
            </h2>
            <p className="mt-3 text-muted-600">
              A complete learning management system built for research education
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Video,
                title: 'Video Lessons',
                desc: 'Watch structured video lessons organized into courses, modules, and learning tracks.',
              },
              {
                icon: FileText,
                title: 'Assignments & Quizzes',
                desc: 'Take automatically graded quizzes and submit assignments for instructor review.',
              },
              {
                icon: Award,
                title: 'Grades & Feedback',
                desc: 'Receive personalized feedback and grades from your instructors on every submission.',
              },
              {
                icon: BookOpen,
                title: 'Research Hub',
                desc: 'Access a curated library of research methodology guides, writing tips, and tools.',
              },
              {
                icon: Users,
                title: 'Student Community',
                desc: 'Join a community of learners and track your progress through structured courses.',
              },
              {
                icon: Microscope,
                title: 'Expert Curriculum',
                desc: 'Learn from a curriculum designed by experienced researchers and educators.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card-hover rounded-xl p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-100">
                  <feature.icon className="h-5 w-5 text-navy-700" />
                </div>
                <h3 className="text-base font-semibold text-navy-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-navy-900">How it works</h2>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Register for free with your email and password. You get instant access to all published courses.',
              },
              {
                step: '02',
                title: 'Learn at your pace',
                desc: 'Watch video lessons, read course materials, and track your progress through each module.',
              },
              {
                step: '03',
                title: 'Test your knowledge',
                desc: 'Take quizzes to check your understanding and submit assignments for instructor feedback.',
              },
              {
                step: '04',
                title: 'Grow with feedback',
                desc: 'Receive detailed grades and feedback to improve your research skills over time.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-muted-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-muted-200 bg-navy-900 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to begin your research journey?
          </h2>
          <p className="mt-3 text-navy-200">
            Join Research Bridge today and start learning.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-navy-900 hover:bg-muted-100"
              onClick={() => navigate('/register')}
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 bg-navy-950 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6">
          <BrandLogo href="/" variant="light" size="sm" />
          <p className="text-sm text-blue-200">From Curiosity to Discovery.</p>
        </div>
      </footer>
    </div>
  );
}
