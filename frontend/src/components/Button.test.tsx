import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with the provided text and defaults to primary variant', () => {
    render(<Button>Save memo</Button>);

    const button = screen.getByRole('button', { name: /save memo/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).not.toBeDisabled();
  });

  it('applies the secondary variant and disabled state', () => {
    render(
      <Button variant="secondary" disabled>
        Reset
      </Button>,
    );

    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toBeDisabled();
  });

  it('invokes the click handler when pressed', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Add memo</Button>);

    const button = screen.getByRole('button', { name: /add memo/i });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

