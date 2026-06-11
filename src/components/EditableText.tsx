import React, { useRef, useEffect } from "react";

export const EditableText = ({ 
  value, 
  onChange, 
  canEdit, 
  className = "", 
  element = "span",
  multiline = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  canEdit: boolean; 
  className?: string; 
  element?: any;
  multiline?: boolean;
}) => {
  const Component = element;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newVal = e.currentTarget.innerText;
    if (newVal !== value) {
      onChange(newVal);
    }
  };

  if (!canEdit) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <Component
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`${className} outline-none border-b border-imperial-gold/20 hover:border-imperial-gold focus:border-imperial-gold bg-imperial-gold/5 transition-colors cursor-text`}
    >
      {value}
    </Component>
  );
};
