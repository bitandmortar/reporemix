import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Input Component
 * 
 * @param {Object} props
 * @param {'text' | 'password' | 'email' | 'number' | 'search'} [props.type='text'] - Input type
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Input value
 * @param {function} [props.onChange] - Change handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.error=false] - Error state
 * @param {string} [props.errorText] - Error message
 * @param {React.ReactNode} [props.leftIcon] - Left icon
 * @param {React.ReactNode} [props.rightIcon] - Right icon
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props.rest - Additional input props
 */
export const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  errorText,
  leftIcon,
  rightIcon,
  className,
  ...rest
}, ref) => {
  const baseStyles = 'w-full px-4 py-2 bg-[#0f121a] border rounded-lg transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateStyles = error
    ? 'border-[#ef476f] focus:border-[#ef476f] focus:ring-[#ef476f]/20'
    : 'border-[#2a2f3e] focus:border-[#ffd166] focus:ring-[#ffd166]/20';
  
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-[#e5e7eb]">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={clsx(
            baseStyles,
            stateStyles,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10'
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...rest}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {errorText && (
        <p className="text-sm text-[#ef476f]">{errorText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
