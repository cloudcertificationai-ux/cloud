import AdminLayout from '@/components/layout/AdminLayout'
import { Providers } from '@/components/providers'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AdminLayout>{children}</AdminLayout>
    </Providers>
  )
}