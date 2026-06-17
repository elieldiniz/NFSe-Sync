import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { Modal, ModalFooter } from '@/shared/components/Modal'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies primary variant class', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-blue')
    expect(button.className).toContain('text-white')
  })

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-white')
    expect(button.className).toContain('text-gray-900')
  })

  it('applies danger variant class', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-red-light')
    expect(button.className).toContain('text-red')
  })

  it('applies sm size class', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-[12px]')
  })

  it('applies md size class', () => {
    render(<Button size="md">Medium</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-[13px]')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.className).toContain('opacity-50')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders icon when provided', () => {
    render(<Button icon={<span data-testid="icon" />}>With Icon</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>OK</Badge>)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('applies ok variant class', () => {
    render(<Badge variant="ok">OK</Badge>)
    const badge = screen.getByText('OK')
    expect(badge.className).toContain('bg-green-light')
    expect(badge.className).toContain('text-green-dark')
  })

  it('applies warn variant class', () => {
    render(<Badge variant="warn">Warn</Badge>)
    const badge = screen.getByText('Warn')
    expect(badge.className).toContain('bg-amber-light')
    expect(badge.className).toContain('text-amber-dark')
  })

  it('applies err variant class', () => {
    render(<Badge variant="err">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge.className).toContain('bg-red-light')
    expect(badge.className).toContain('text-red-dark')
  })

  it('applies default variant class', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-600')
  })
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstElementChild
    expect(card?.className).toContain('bg-white')
    expect(card?.className).toContain('border-gray-200')
    expect(card?.className).toContain('rounded-xl')
  })

  it('accepts custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByText('Content').closest('[class*="bg-white"]')
    expect(card?.className).toContain('custom-class')
  })
})

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(<Input />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

describe('Modal', () => {
  it('renders title', () => {
    render(
      <Modal onClose={vi.fn()} title="Test Modal">
        <div>Content</div>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Modal onClose={vi.fn()} title="Modal">
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} title="Modal">
        <div>Content</div>
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} title="Modal">
        <div>Content</div>
      </Modal>
    )
    const overlay = screen.getByText('Modal').closest('.modal-bg')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('ModalFooter', () => {
  it('renders children', () => {
    render(
      <ModalFooter>
        <button>Cancel</button>
        <button>Save</button>
      </ModalFooter>
    )
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('applies footer styles', () => {
    render(
      <ModalFooter>
        <div>Content</div>
      </ModalFooter>
    )
    const footer = screen.getByText('Content').parentElement
    expect(footer?.className).toContain('modal-footer')
    expect(footer?.className).toContain('border-t')
  })
})
