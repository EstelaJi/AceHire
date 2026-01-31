import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'python' | 'java';
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  height = '400px',
  readOnly = false 
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tabs
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {language === 'javascript' && 'JavaScript'}
            {language === 'python' && 'Python'}
            {language === 'java' && 'Java'}
          </span>
        </div>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          className="w-full p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none"
          style={{ height }}
          placeholder="Write your code here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}