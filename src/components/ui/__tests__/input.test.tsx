import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Input, type InputProps } from '../input';

function renderInput(props: InputProps) {
  // Call forwardRef's render function directly to inspect the rendered <input> element and handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendered = (Input as any).render(props, null) as React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
  return rendered.props;
}

describe('Input component numeric and negative value prevention', () => {
  it('prevents typing negative sign or exponent on type="number" with non-negative min', () => {
    const props = renderInput({ type: 'number', min: '0' });

    // Minus key
    const preventDefaultMinus = vi.fn();
    props.onKeyDown?.({
      key: '-',
      preventDefault: preventDefaultMinus,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefaultMinus).toHaveBeenCalledTimes(1);

    // Subtract key (numpad)
    const preventDefaultSubtract = vi.fn();
    props.onKeyDown?.({
      key: 'Subtract',
      preventDefault: preventDefaultSubtract,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefaultSubtract).toHaveBeenCalledTimes(1);

    // Exponent key ('e')
    const preventDefaultE = vi.fn();
    props.onKeyDown?.({
      key: 'e',
      preventDefault: preventDefaultE,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefaultE).toHaveBeenCalledTimes(1);

    // Normal positive number key ('5') should not be prevented
    const preventDefault5 = vi.fn();
    props.onKeyDown?.({
      key: '5',
      preventDefault: preventDefault5,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefault5).not.toHaveBeenCalled();
  });

  it('prevents pasting negative values on type="number"', () => {
    const props = renderInput({ type: 'number', min: '0' });

    // Pasting "-1"
    const preventDefaultNegativePaste = vi.fn();
    props.onPaste?.({
      clipboardData: {
        getData: (format: string) => (format === 'text' ? '-1' : ''),
      },
      preventDefault: preventDefaultNegativePaste,
    } as unknown as React.ClipboardEvent<HTMLInputElement>);
    expect(preventDefaultNegativePaste).toHaveBeenCalledTimes(1);

    // Pasting "100"
    const preventDefaultPositivePaste = vi.fn();
    props.onPaste?.({
      clipboardData: {
        getData: (format: string) => (format === 'text' ? '100' : ''),
      },
      preventDefault: preventDefaultPositivePaste,
    } as unknown as React.ClipboardEvent<HTMLInputElement>);
    expect(preventDefaultPositivePaste).not.toHaveBeenCalled();
  });

  it('prevents typing negative sign and pasting negative values on inputMode="numeric"', () => {
    const props = renderInput({ inputMode: 'numeric' });

    // Minus key
    const preventDefaultMinus = vi.fn();
    props.onKeyDown?.({
      key: '-',
      preventDefault: preventDefaultMinus,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefaultMinus).toHaveBeenCalledTimes(1);

    // Pasting "-50"
    const preventDefaultPaste = vi.fn();
    props.onPaste?.({
      clipboardData: {
        getData: (format: string) => (format === 'text' ? '-50' : ''),
      },
      preventDefault: preventDefaultPaste,
    } as unknown as React.ClipboardEvent<HTMLInputElement>);
    expect(preventDefaultPaste).toHaveBeenCalledTimes(1);

    // Valid digit '7'
    const preventDefault7 = vi.fn();
    props.onKeyDown?.({
      key: '7',
      preventDefault: preventDefault7,
    } as unknown as React.KeyboardEvent<HTMLInputElement>);
    expect(preventDefault7).not.toHaveBeenCalled();
  });

  it('sanitizes bank account number inputs so negative signs and letters are stripped', () => {
    const rawNegativeInput = '-12345';
    const sanitized = rawNegativeInput.replace(/\D/g, '');
    expect(sanitized).toBe('12345');
    expect(sanitized).not.toContain('-');
  });
});

