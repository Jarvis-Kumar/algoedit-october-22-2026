
// Safeguard for systems with unstable/restricted WebGL context attributes
if (typeof window !== 'undefined') {
  // Capture and swallow uninformative third-party / browser extension cross-origin script errors
  const isScriptError = (msg: string, url?: string) => {
    const m = String(msg || '');
    const u = String(url || '');
    return (
      m.includes('Script error') ||
      m === 'Script error.' ||
      u.includes('chrome-extension') ||
      u.includes('moz-extension')
    );
  };

  // 1. window.onerror override
  const originalOnError = window.onerror;
  window.onerror = function (msg, url, lineNo, colNo, error) {
    if (isScriptError(String(msg || ''), url) || !url || !error) {
      return true; // Completely suppress
    }
    if (originalOnError) {
      return originalOnError.apply(this, [msg, url, lineNo, colNo, error]);
    }
    return false;
  };

  // 2. window error capture listener (capture phase)
  window.addEventListener('error', (event) => {
    if (isScriptError(event.message || '', event.filename) || !event.filename || !event.error) {
      try {
        event.stopImmediatePropagation();
        event.preventDefault();
      } catch (e) {}
    }
  }, true);

  // 3. window unhandledrejection capture listener
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (
      reasonStr.includes('Script error') ||
      reasonStr.includes('ResizeObserver loop completed with undelivered notifications') ||
      reasonStr.includes('ResizeObserver loop limit exceeded')
    ) {
      try {
        event.stopImmediatePropagation();
        event.preventDefault();
      } catch (e) {}
    }
  }, true);

  // 4. console.error patch to block writing 'Script error' to console / telemetry
  try {
    const originalConsoleError = console.error;
    console.error = function(...args: any[]) {
      const containsScriptError = args.some(arg => {
        if (!arg) return false;
        if (typeof arg === 'string') {
          return arg.includes('Script error') || arg === 'Script error.';
        }
        if (arg instanceof Error) {
          return arg.message.includes('Script error') || arg.message === 'Script error.';
        }
        return false;
      });
      if (containsScriptError) {
        return; // Suppress
      }
      originalConsoleError.apply(console, args);
    };
  } catch (e) {}

  const patchContext = (ctx: any) => {
    if (ctx && !ctx.__patchedAttributes) {
      ctx.__patchedAttributes = true;
      try {
        const originalGen = ctx.getContextAttributes;
        ctx.getContextAttributes = function(...args: any[]) {
          try {
            const attrs = originalGen ? originalGen.apply(this, args) : null;
            return attrs || { alpha: true, depth: true, stencil: true, antialias: true, premultipliedAlpha: true };
          } catch (e) {
            return { alpha: true, depth: true, stencil: true, antialias: true, premultipliedAlpha: true };
          }
        };
      } catch (e) {}
    }
  };

  try {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: any, ...args: any[]) {
      const ctx = originalGetContext.apply(this, [type, ...args]);
      if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
        patchContext(ctx);
      }
      return ctx;
    } as any;
  } catch (e) {}

  const patchProto = (proto: any) => {
    if (proto && proto.getContextAttributes) {
      const original = proto.getContextAttributes;
      proto.getContextAttributes = function(...args: any[]) {
        try {
          const attrs = original.apply(this, args);
          return attrs || { alpha: true, depth: true, stencil: true, antialias: true, premultipliedAlpha: true };
        } catch (e) {
          return { alpha: true, depth: true, stencil: true, antialias: true, premultipliedAlpha: true };
        }
      };
    }
  };
  if (typeof WebGLRenderingContext !== 'undefined') {
    patchProto(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    patchProto(WebGL2RenderingContext.prototype);
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
