import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Search01Icon,
  RefreshIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { ApiError } from "@/api/errors"
import { cn } from "@/lib/utils"

type IconData = typeof AlertCircleIcon

const btn =
  "inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

/* ---------- Loading ---------- */

export function Spinner({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      size={size}
      className={cn("animate-spin motion-reduce:animate-none", className)}
    />
  )
}

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function CardGridSkeleton({
  count = 12,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border bg-card">
          <div className="h-36 animate-pulse bg-muted motion-reduce:animate-none" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-1/3 animate-pulse bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-full animate-pulse bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-5/6 animate-pulse bg-muted motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Shared message block ---------- */

type BlockProps = {
  icon: IconData
  title: string
  description?: string
  action?: ReactNode
  tone?: "default" | "error"
  role?: "alert" | "status"
  className?: string
}

function StateBlock({
  icon,
  title,
  description,
  action,
  tone = "default",
  role,
  className,
}: BlockProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex min-h-64 flex-col items-center justify-center gap-3 border p-8 text-center",
        tone === "error" ? "border-destructive/50" : "border-dashed",
        className
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={32}
        className={
          tone === "error" ? "text-destructive" : "text-muted-foreground"
        }
      />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

/* ---------- Empty ---------- */

type EmptyProps = {
  title?: string
  description?: string
  icon?: IconData
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title = "Nothing here",
  description = "There's nothing to show yet.",
  icon = Search01Icon,
  actionLabel,
  onAction,
  className,
}: EmptyProps) {
  return (
    <StateBlock
      icon={icon}
      title={title}
      description={description}
      className={className}
      action={
        actionLabel && onAction ? (
          <button type="button" onClick={onAction} className={btn}>
            {actionLabel}
          </button>
        ) : undefined
      }
    />
  )
}

/* ---------- Error ---------- */

function describe(error: Error | null | undefined): {
  title: string
  description: string
} {
  const status = error instanceof ApiError ? error.status : undefined
  const message = error?.message ?? "Something went wrong."

  if (error instanceof ApiError && status === undefined)
    return { title: "Connection problem", description: message }
  switch (status) {
    case 401:
      return { title: "API key problem", description: message }
    case 403:
      return { title: "Request limit reached", description: message }
    case 404:
      return { title: "Not found", description: message }
    case 429:
      return { title: "Slow down a moment", description: message }
    default:
      return { title: "Something went wrong", description: message }
  }
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error?: Error | null
  onRetry?: () => void
  className?: string
}) {
  const { title, description } = describe(error)
  return (
    <StateBlock
      role="alert"
      tone="error"
      icon={AlertCircleIcon}
      title={title}
      description={description}
      className={className}
      action={
        onRetry ? (
          <button type="button" onClick={onRetry} className={btn}>
            <HugeiconsIcon icon={RefreshIcon} size={16} />
            Try again
          </button>
        ) : undefined
      }
    />
  )
}

/* ---------- One wrapper for any query ---------- */

type BoundaryProps<T> = {
  query: UseQueryResult<T, Error>
  loading?: ReactNode
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryBoundary<T>({
  query,
  loading,
  isEmpty,
  empty,
  children,
}: BoundaryProps<T>) {
  if (query.isPending) return <>{loading ?? <PageLoading />}</>
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState />}</>
  return <>{children(query.data)}</>
}
