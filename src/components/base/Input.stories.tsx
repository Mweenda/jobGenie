// import type { Meta, StoryObj } from '@storybook/react'
import { Mail, Lock, Search, User } from 'lucide-react'
import Input from './Input'

const meta = {
  title: 'Components/Base/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with label, validation, icons, and helper text support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'HTML input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
    required: {
      control: 'boolean',
      description: 'Marks the input as required',
    },
  },
} // satisfies Meta<typeof Input>

export default meta
// type Story = StoryObj<typeof meta>
type Story = any

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    error: 'Password must be at least 8 characters',
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    helperText: 'Username must be unique and contain only letters and numbers',
  },
}

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    leftIcon: <Mail className="w-4 h-4" />,
  },
}

export const WithRightIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search jobs...',
    rightIcon: <Search className="w-4 h-4" />,
  },
}

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    leftIcon: <User className="w-4 h-4" />,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Cannot edit this',
  },
}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    leftIcon: <Lock className="w-4 h-4" />,
    helperText: 'Must be at least 8 characters with uppercase, lowercase, and number',
  },
}

export const FormExample: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        leftIcon={<Lock className="w-4 h-4" />}
        helperText="Must be at least 8 characters"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm password"
        leftIcon={<Lock className="w-4 h-4" />}
        error="Passwords do not match"
      />
    </div>
  ),
}