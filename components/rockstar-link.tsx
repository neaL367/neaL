'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

const emptySubscribe = () => () => {};

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function RockstarLink({ href, children, className, style, ...props }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const cursorRef = useRef<HTMLSpanElement>(null);

  const updatePosition = (clientX: number, clientY: number) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    updatePosition(e.clientX, e.clientY);
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${className ?? ''} cursor-none select-none`}
        style={style}
        {...props}
      >
        {children}
      </a>

      {isMounted &&
        createPortal(
          <span
            ref={cursorRef}
            aria-hidden="true"
            className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
          >
            <span
              className={`relative block h-10 w-10 overflow-hidden rounded-lg  transition-all duration-150 ease-out origin-center ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              <Image
                src="/rockstar-logo.jpg"
                alt="Rockstar Games Cursor"
                width={44}
                height={44}
                className="h-full w-full rounded-lg object-cover"
                priority
              />
            </span>
          </span>,
          document.body,
        )}
    </>
  );
}
