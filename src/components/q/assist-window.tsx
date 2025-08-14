
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
    // Open a new window and store a reference to it.
    const newWindow = window.open('', '', 'width=800,height=600,left=200,top=200');
    if (newWindow) {
      externalWindowRef.current = newWindow;
      newWindow.document.title = "Q_ Assist Mode";
      
      // Create a container div in the new window.
      const portalContainer = newWindow.document.createElement('div');
      newWindow.document.body.appendChild(portalContainer);
      newWindow.document.body.style.margin = '0'; // Reset default body margin
      containerRef.current = portalContainer;
      
      // Copy styles from the main document to the new window
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) { // For inline <style> tags
            const newStyleEl = newWindow.document.createElement('style');
            Array.from(styleSheet.cssRules).forEach(rule => {
              newStyleEl.appendChild(newWindow.document.createTextNode(rule.cssText));
            });
            newWindow.document.head.appendChild(newStyleEl);
          } else if (styleSheet.href) { // For <link> stylesheets
            const newLinkEl = newWindow.document.createElement('link');
            newLinkEl.rel = 'stylesheet';
            newLinkEl.href = styleSheet.href;
            newWindow.document.head.appendChild(newLinkEl);
          }
        } catch (e) {
            console.warn("Could not copy some styles to assist window:", e)
        }
      });
      
      // Monitor the window. If the user closes it, trigger the onClose callback.
      const interval = setInterval(() => {
        if (newWindow.closed) {
          onClose();
          clearInterval(interval);
        }
      }, 1000);

      // Cleanup function to close the window and interval when the component unmounts.
      return () => {
        clearInterval(interval);
        if (!newWindow.closed) {
          newWindow.close();
        }
      };
    } else {
        alert("Could not open new window. Please check your browser's pop-up settings.");
        onClose();
    }
  }, [onClose]);

  // If the container in the new window is ready, create a portal and render children into it.
  if (containerRef.current) {
    return createPortal(children, containerRef.current);
  }

  return null;
}
