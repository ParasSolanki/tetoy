import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/storage/$id/activity')({
  component: () => <div>Hello /_auth/storage/$id/activity!</div>
})