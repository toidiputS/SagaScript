import { useState, useRef, useCallback } from 'react';

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export function useTextEditor(initialValue: string = '', onChange?: (value: string) => void) {
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateValue = useCallback((newValue: string, addToHistory = true) => {
    setValue(newValue);
    onChange?.(newValue);
    
    if (addToHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [onChange, history, historyIndex]);

  const getSelection = useCallback((): TextSelection => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: '' };
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.substring(start, end);
    
    return { start, end, text };
  }, [value]);

  const setSelection = useCallback((start: number, end: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.focus();
    textarea.setSelectionRange(start, end);
  }, []);

  const insertText = useCallback((text: string, replaceSelection = true) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newValue = replaceSelection 
      ? value.substring(0, start) + text + value.substring(end)
      : value.substring(0, start) + text + value.substring(start);
    
    updateValue(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + text.length;
      setSelection(newPosition, newPosition);
    }, 0);
  }, [value, updateValue, setSelection]);

  const wrapSelection = useCallback((before: string, after: string = before) => {
    const selection = getSelection();
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    if (selection.text) {
      // Wrap selected text
      const newText = before + selection.text + after;
      const newValue = value.substring(0, selection.start) + newText + value.substring(selection.end);
      updateValue(newValue);
      
      setTimeout(() => {
        setSelection(selection.start + before.length, selection.start + before.length + selection.text.length);
      }, 0);
    } else {
      // Insert wrapper and place cursor in middle
      const newText = before + after;
      insertText(newText);
      
      setTimeout(() => {
        const newPosition = selection.start + before.length;
        setSelection(newPosition, newPosition);
      }, 0);
    }
  }, [getSelection, value, updateValue, insertText, setSelection]);

  const replaceSelection = useCallback((newText: string) => {
    const selection = getSelection();
    const newValue = value.substring(0, selection.start) + newText + value.substring(selection.end);
    updateValue(newValue);
    
    setTimeout(() => {
      const newPosition = selection.start + newText.length;
      setSelection(newPosition, newPosition);
    }, 0);
  }, [getSelection, value, updateValue, setSelection]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Text formatting actions
  const actions = {
    bold: () => wrapSelection('**'),
    italic: () => wrapSelection('*'),
    underline: () => wrapSelection('<u>', '</u>'),
    strikethrough: () => wrapSelection('~~'),
    code: () => wrapSelection('`'),
    quote: () => {
      const selection = getSelection();
      const lines = selection.text.split('\n');
      const quotedLines = lines.map(line => `> ${line}`);
      replaceSelection(quotedLines.join('\n'));
    },
    heading: (level: number) => {
      const selection = getSelection();
      const prefix = '#'.repeat(level) + ' ';
      
      if (selection.text) {
        replaceSelection(prefix + selection.text);
      } else {
        insertText(prefix);
      }
    },
    list: (type: 'bullet' | 'numbered') => {
      const selection = getSelection();
      const lines = selection.text.split('\n');
      const listItems = lines.map((line, index) => {
        const prefix = type === 'bullet' ? '- ' : `${index + 1}. `;
        return prefix + line;
      });
      replaceSelection(listItems.join('\n'));
    },
    link: () => {
      const selection = getSelection();
      const linkText = selection.text || 'Link text';
      const linkUrl = prompt('Enter URL:') || 'https://';
      replaceSelection(`[${linkText}](${linkUrl})`);
    },
    image: () => {
      const altText = prompt('Enter alt text:') || 'Image';
      const imageUrl = prompt('Enter image URL:') || '';
      insertText(`![${altText}](${imageUrl})`);
    },
    hr: () => insertText('\n---\n'),
    undo,
    redo,
    canUndo,
    canRedo
  };

  return {
    value,
    setValue: updateValue,
    textareaRef,
    getSelection,
    setSelection,
    insertText,
    wrapSelection,
    replaceSelection,
    actions
  };
}