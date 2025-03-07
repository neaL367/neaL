"use client";

import { memo } from "react";

interface AnimatedTextProps {
  text?: string;
  delayStep?: number;
  className?: string;
}

const AnimatedText = memo(function AnimatedText({
  text,
  delayStep = 25,
  className = "",
}: AnimatedTextProps) {
  return (
    <span className={className}>
      {text?.split("").map((letter, index) => (
        <span
          key={index}
          className="inline-block"
          style={{ transitionDelay: `${index * delayStep}ms` }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </span>
  );
});

interface GreetingProps {
  primaryText?: string;
  secondaryText?: string;
  emoji?: string;
  delayStep?: number;
  className?: string;
}

export default function Greeting({
  primaryText,
  secondaryText,
  emoji = "👋",
  delayStep = 25,
  className = "text-xl font-medium",
}: GreetingProps) {
  return (
    <p className={className}>
      <span
        className="block overflow-hidden relative group font-inter"
        role="text"
        aria-label={`Greeting that changes from "${primaryText}" to "${secondaryText}" on hover`}
      >
        <span className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
          <AnimatedText text={primaryText} delayStep={delayStep} />
          {emoji && <span className="ml-2 inline-block">{emoji}</span>}
        </span>
        <span className="inline-block absolute left-0 top-0 transition-all duration-300 ease-in-out translate-y-full group-hover:translate-y-0 whitespace-nowrap">
          <AnimatedText text={secondaryText} delayStep={delayStep} />
          {emoji && <span className="ml-2 inline-block">{emoji}</span>}
        </span>
      </span>
    </p>
  );
}
