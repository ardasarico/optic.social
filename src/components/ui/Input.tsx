import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, containerClassName = '', placeholder = 'placeholder', className = '', ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      <label htmlFor={inputId} className="text-[14px] leading-[20px] font-medium text-neutral-500">
        {label}
      </label>
      <input
        id={inputId}
        placeholder={placeholder}
        className={`ring-blue rounded-[16px] bg-neutral-200 p-4 px-5 py-3 text-[16px] leading-[24px] font-medium text-neutral-800 outline-none! ring-inset placeholder:text-neutral-500 focus:ring-2 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
