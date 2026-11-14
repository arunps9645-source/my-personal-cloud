import { Link } from 'react-router-dom'
import { EmptyState } from '../components/PageHeader'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <EmptyState icon={Compass} title="Page not found" text="That page doesn't exist.">
      <Link to="/" className="btn-primary">Back to dashboard</Link>
    </EmptyState>
  )
}
