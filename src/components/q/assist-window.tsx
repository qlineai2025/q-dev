
"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AssistWindowProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function AssistWindow({ children, onClose }: AssistWindowProps) {
  const externalWindowRef = useRef<Window | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      externalWindowRef.current = newWindow;
      containerRef.current = newWindow.document.createElement('div');
      newWindow.document.body.appendChild(containerRef.current);
      newWindow.document.title = "Q_ Assist Mode";

      // Copy styles from the main document to the new window
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            const newStyleEl = newWindow.document.createElement('style');
            Array.from(styleSheet.cssRules).forEach(rule => {
              newStyleEl.appendChild(newWindow.document.createTextNode(rule.cssText));
            });
            newWindow.document.head.appendChild(newStyleEl);
          } else if (styleSheet.href) {
            const newLinkEl = newWindow.document.createElement('link');
            newLinkEl.rel = 'stylesheet';
            newLinkEl.href = styleSheet.href;
            newWindow.document.head.appendChild(newLinkEl);
          }
        } catch (e) {
            // console.warn("Could not copy some styles:", e)
        }
      });
      
      const interval = setInterval(() => {
        if (newWindow.closed) {
          onClose();
          clearInterval(interval);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        if (!newWindow.closed) {
          newWindow.close();
        }
        onClose();
      };
    } else {
        alert("Could not open new window. Please check your browser's pop-up settings.");
        onClose();
    }
  }, [onClose]);

  if (containerRef.current) {
    return createPortal(children, containerRef.current);
  }

  return null;
}
