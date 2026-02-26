'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
  { name: 'Instructors', href: '/admin/instructors', icon: AcademicCapIcon },
  { name: 'Students', href: '/admin/students', icon: UserGroupIcon },
  { name: 'Contact Submissions', href: '/admin/contact-submissions', icon: EnvelopeIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon },
  { name: 'Security', href: '/admin/security', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <div className="text-navy-600 font-medium">Loading Cloud Certification Admin...</div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white/10 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-20 bg-white/80 backdrop-blur-md shadow-soft border-b border-neutral-100">
          <button
            className="px-4 border-r border-neutral-200 text-navy-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 md:hidden hover:bg-teal-50 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full max-w-lg">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-navy-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-xl leading-5 bg-white/50 placeholder-navy-400 focus:outline-none focus:placeholder-navy-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-navy-900 transition-all"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="bg-white/50 p-2 rounded-xl text-navy-400 hover:text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all">
                <BellIcon className="h-6 w-6" />
              </button>
              
              {/* User menu */}
              <div className="flex items-center space-x-3 bg-white/50 rounded-xl px-3 py-2">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-8 w-8 text-navy-400" />
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-navy-700">{session?.user?.name}</div>
                    <div className="text-xs text-navy-500 capitalize">{session?.user?.role?.replace('_', ' ')}</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1 rounded-lg text-navy-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="page-transition">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-0 flex-1 bg-white shadow-xl">
      <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="/cloud-certification-logo.png" 
              alt="Cloud Certification Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">Cloud Certification</h1>
              <p className="text-xs text-navy-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-5 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link group ${isActive ? 'active' : ''}`}
              >
                <item.icon className={`mr-4 h-6 w-6 transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-navy-400 group-hover:text-teal-600'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Bottom section */}
        <div className="flex-shrink-0 px-4 py-4">
          <div className="bg-gradient-to-r from-teal-50 to-navy-50 rounded-xl p-4 border border-teal-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">?</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-navy-700">Need help?</p>
                <p className="text-xs text-navy-500">Check our docs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}