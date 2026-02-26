interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style = {
    width: width || undefined,
    height: height || undefined,
  }

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <Skeleton variant="rectangular" height="12rem" className="mb-4" />
      <Skeleton variant="text" height="1.5rem" width="70%" className="mb-2" />
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonCourseCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <Skeleton variant="rectangular" height="12rem" />
      <div className="p-4">
        <Skeleton variant="text" height="1.25rem" width="80%" className="mb-2" />
        <SkeletonText lines={2} className="mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height="1rem" width="4rem" />
          <Skeleton variant="text" height="1rem" width="3rem" />
        </div>
      </div>
    </div>
  )
}
