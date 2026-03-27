'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Professional themed select/dropdown component
 * Matches app's modern gradient aesthetic
 * 
 * @param {Object} props
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler (e) => {}
 * @param {Array} props.options - Array of {value, label} objects or strings
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.multiple - Enable multi-select
 * @param {string} props.className - Additional CSS classes
 * @param {Array} props.children - Option elements (alternative to options prop)
 * @param {number} props.size - Size for multi-select (height in lines)
 */
const SelectField = React.forwardRef(({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  multiple = false,
  className = '',
  children,
  size,
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value.length === 0 ? placeholder : `${value.length} selected`;
    }
    if (!value) return placeholder;
    if (options.length > 0) {
      const selected = options.find(opt =>
        typeof opt === 'string' ? opt === value : opt.value === value
      );
      return selected ? (typeof selected === 'string' ? selected : selected.label) : placeholder;
    }
    return value;
  };

  // If children provided (native options), render as native select with styling
  if (children) {
    return (
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        multiple={multiple}
        size={size}
        disabled={disabled}
        className={`
          w-full px-4 py-3.5
          bg-gradient-to-br from-slate-800/40 to-slate-900/60
          border border-blue-500/20 hover:border-blue-500/40
          rounded-xl
          text-white font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0
          focus:border-blue-500/60
          transition-all duration-300
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-blue-500/10
          hover:shadow-blue-500/20 hover:shadow-lg
          appearance-none
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-3.5
          bg-gradient-to-br from-slate-800/40 to-slate-900/60
          border-2 border-blue-500/20
          rounded-xl
          text-white font-medium text-left
          flex items-center justify-between gap-3
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          focus:border-blue-500/60
          transition-all duration-300
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-blue-500/10
          hover:border-blue-500/40 hover:shadow-blue-500/20 hover:shadow-lg
          hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/70
          ${isOpen ? 'border-blue-500/60 bg-gradient-to-br from-slate-800/60 to-slate-900/70 shadow-blue-500/30 shadow-xl' : ''}
        `}
      >
        <span className="flex-1 truncate">{getDisplayValue()}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-blue-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500/30 rounded-xl shadow-2xl shadow-blue-500/20 overflow-hidden animate-in fade-in-0 zoom-in-95"
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option, idx) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const isSelected = multiple
                ? Array.isArray(value) && value.includes(optValue)
                : value === optValue;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (multiple && Array.isArray(value)) {
                      const newValue = value.includes(optValue)
                        ? value.filter(v => v !== optValue)
                        : [...value, optValue];
                      onChange({ target: { value: newValue } });
                    } else {
                      onChange({ target: { value: optValue } });
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    w-full px-4 py-3.5 text-left
                    border-none
                    transition-all duration-200
                    cursor-pointer
                    font-medium text-sm
                    flex items-center gap-3
                    ${isSelected
                      ? 'bg-gradient-to-r from-blue-600/60 to-indigo-600/60 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                    }
                  `}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => { }}
                      className="w-4 h-4 rounded border-blue-500/50 bg-slate-800/50 checked:bg-blue-600 accent-blue-600 cursor-pointer"
                    />
                  )}
                  <span className="flex-1">{optLabel}</span>
                  {isSelected && !multiple && (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';
export default SelectField;
