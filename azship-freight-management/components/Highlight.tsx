import React from 'react';

interface HighlightProps {
  text: string;
  highlight: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  
  // Escape special characters in the highlight string for the RegExp
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-az-yellow/70 text-az-blue px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default Highlight;
