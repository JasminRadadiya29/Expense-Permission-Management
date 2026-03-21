import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

// Global translucent iOS-like pointer that follows the cursor and morphs on hover targets
export default function GlobalPointer() {
  // Disable on touch devices (no hover)
  const isTouch = typeof window !== 'undefined' && (window.matchMedia?.('(hover: none)').matches || 'ontouchstart' in window);
  if (isTouch) return null;

  // Track cursor position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring for smooth follow
  const springConfig = { stiffness: 650, damping: 42, mass: 0.9 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Size and radius morphing
  const width = useMotionValue(20);
  const height = useMotionValue(20);
  const borderRadius = useMotionValue(10);

  // Visual emphasis while hovering interactive elements
  const scale = useSpring(1, { stiffness: 500, damping: 32 });
  const opacity = useSpring(0.9, { stiffness: 250, damping: 28 });

  const activeTargetRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef(null);

  const defaultStyle = useMemo(() => ({
    width: 20,
    height: 20,
    radius: 10,
    scale: 1,
  }), []);

  // Card snapping removed per request

  // Determine if element is interactive (buttons, links, or explicit opt-ins - inputs excluded)
  function isInteractive(el) {
    if (!el || el === document.body) return false;
    if (el.closest?.('[data-pointer-ignore="true"]')) return false;
    const tag = el.tagName?.toLowerCase();
    // Only buttons and links by default (inputs excluded)
    if (['a', 'button'].includes(tag)) return true;
    // Never treat labels or inputs as targets
    if (['label', 'input', 'select', 'textarea'].includes(tag)) return false;
    const role = el.getAttribute?.('role');
    if (role && ['button', 'link', 'menuitem', 'tab', 'switch'].includes(role)) return true;
    // Explicit opt-in hooks only (cards excluded)
    if (el.closest?.('[data-hover], .hover-target, [data-pointer-target="true"]')) return true;
    // Consider keyboard-focusable interactive elements
    if (el.getAttribute?.('tabindex') === '0') return true;
    return false;
  }

  // Animate pointer towards element's rect with magnetic snap, matching size and radius
  function snapToElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 6; // slight padding around element for iPadOS-like halo
    const targetWidth = Math.max(22, rect.width + padding * 2);
    const targetHeight = Math.max(22, rect.height + padding * 2);
    const computedRadius = parseFloat(getComputedStyle(el).borderRadius || '8');

    animate(width, targetWidth, { type: 'spring', stiffness: 360, damping: 34 });
    animate(height, targetHeight, { type: 'spring', stiffness: 360, damping: 34 });
    animate(borderRadius, Math.max(8, computedRadius + padding / 2), { type: 'spring', stiffness: 360, damping: 34 });
    scale.set(1.01);

    // Center pointer on element (viewport coords for fixed element)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(centerX);
    mouseY.set(centerY);
  }

  function resetPointer() {
    animate(width, defaultStyle.width, { type: 'spring', stiffness: 500, damping: 34 });
    animate(height, defaultStyle.height, { type: 'spring', stiffness: 500, damping: 34 });
    animate(borderRadius, defaultStyle.radius, { type: 'spring', stiffness: 500, damping: 34 });
    scale.set(defaultStyle.scale);
  }

  useEffect(() => {
    // Track raw mouse
    const onMove = (e) => {
      if (activeTargetRef.current) return; // while snapped, ignore raw moves to avoid jitter
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Debounced hover detection using pointer events
    const onPointerOver = (e) => {
      let el = e.target;
      if (!el) return;

      // If hovering a label, target its associated control instead
      const tag = el.tagName?.toLowerCase();
      if (tag === 'label') {
        const htmlFor = el.getAttribute('for');
        const forControl = htmlFor ? document.getElementById(htmlFor) : null;
        const descendantControl = el.querySelector?.('input, select, textarea, button, a');
        el = forControl || descendantControl || el; // fall back to label if none found
      }

      if (!isInteractive(el)) return;

      const target = el.closest?.('a, button, [data-hover], .hover-target, [data-pointer-target="true"]') || el;
      if (!target || target.matches?.('[data-pointer-ignore="true"]')) return;

      activeTargetRef.current = target;
      snapToElement(target);
    };

    const onPointerOut = (e) => {
      if (!activeTargetRef.current) return;
      if (!e.relatedTarget || !activeTargetRef.current.contains(e.relatedTarget)) {
        activeTargetRef.current = null;
        resetPointer();
      }
    };

    const onScroll = () => {
      // Keep pointer aligned to element while scrolling
      if (activeTargetRef.current) snapToElement(activeTargetRef.current);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, true);
    document.addEventListener('pointerout', onPointerOut, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('pointerout', onPointerOut, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Render single global element fixed to viewport
  return (
    <motion.div
      ref={pointerRef}
      className="pointer-events-none fixed z-[9999] top-0 left-0 will-change-transform"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        width,
        height,
        borderRadius,
        scale,
        opacity,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div className="glass-pointer w-full h-full rounded-[inherit]" />
    </motion.div>
  );
}


