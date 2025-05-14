import React, { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder?: string;
  containerClassName?: string;
  lines?: number;
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, containerClassName = '', placeholder = 'placeholder', className = '', lines = 3, ...props }) => {
  const textAreaId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      <label htmlFor={textAreaId} className="text-[14px] leading-[20px] font-medium text-neutral-500">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={textAreaId}
          placeholder={placeholder}
          rows={lines}
          className={`ring-blue custom-scrollbar w-full resize-none overflow-y-auto rounded-[16px] bg-neutral-200 p-4 px-5 py-3 pr-7 text-[16px] leading-[24px] font-medium text-neutral-800 outline-none ring-inset placeholder:text-neutral-500 focus:ring-2 ${className}`}
          {...props}
        />

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 16px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--color-neutral-400);
            border-radius: 32px;
            background-clip: padding-box;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 4px solid transparent;
            border-right: 8px solid transparent;
          }
        `}</style>
      </div>
    </div>
  );
};

export default TextArea;
