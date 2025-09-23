import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Mail, Search } from 'lucide-react'
import Input from '../Input'

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('displays helper text when no error', () => {
    render(<Input label="Password" helperText="Must be 8 characters" />)
    expect(screen.getByText('Must be 8 characters')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(
      <Input 
        label="Password" 
        helperText="Must be 8 characters" 
        error="Password is required"
      />
    )
    expect(screen.queryByText('Must be 8 characters')).not.toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('renders left icon', () => {
    render(<Input leftIcon={<Mail data-testid="mail-icon" />} />)
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Input rightIcon={<Search data-testid="search-icon" />} />)
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('applies correct padding for left icon', () => {
    render(<Input leftIcon={<Mail />} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pl-10')
  })

  it('applies correct padding for right icon', () => {
    render(<Input rightIcon={<Search />} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('pr-10')
  })

  it('handles onChange events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalledTimes(4) // Once for each character
  })

  it('handles onKeyPress events', async () => {
    const handleKeyPress = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onKeyPress={handleKeyPress} />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'a')
    expect(handleKeyPress).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('applies error styling when error is present', () => {
    render(<Input error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" label="Password" />)
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  // it('forwards ref correctly', () => {
  //   const ref = { current: null }
  //   render(<Input ref={ref} />)
  //   expect(ref.current).toBeTruthy()
  // })
})