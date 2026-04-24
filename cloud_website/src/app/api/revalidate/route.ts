// src/app/api/revalidate/route.ts
// On-demand ISR revalidation endpoint.
// Called by sync-worker.ts when course/enrollment data changes.
// Also called directly by admin panel via REVALIDATION_SECRET.

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify secret
  const authHeader = request.headers.get('Authorization')
  const secret = process.env.REVALIDATION_SECRET

  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { path?: string; paths?: string[]; tag?: string; tags?: string[] }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const revalidated: string[] = []

  // Revalidate individual paths
  const paths = body.paths ?? (body.path ? [body.path] : [])
  for (const path of paths) {
    try {
      revalidatePath(path)
      revalidated.push(`path:${path}`)
    } catch (err) {
      console.error(`[revalidate] Failed to revalidate path "${path}":`, (err as Error).message)
    }
  }

  // Revalidate by Next.js cache tags (more precise than paths)
  const tags = body.tags ?? (body.tag ? [body.tag] : [])
  for (const tag of tags) {
    try {
      revalidateTag(tag)
      revalidated.push(`tag:${tag}`)
    } catch (err) {
      console.error(`[revalidate] Failed to revalidate tag "${tag}":`, (err as Error).message)
    }
  }

  if (revalidated.length === 0) {
    return NextResponse.json({ error: 'No path, paths, tag, or tags provided' }, { status: 400 })
  }

  console.log(`[revalidate] ✓ Revalidated: ${revalidated.join(', ')}`)

  return NextResponse.json({
    revalidated: true,
    items: revalidated,
    timestamp: new Date().toISOString(),
  })
}
