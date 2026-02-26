export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-teal-50/30">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <div className="text-navy-600 font-medium">Loading Admin Panel...</div>
      </div>
    </div>
  )
}