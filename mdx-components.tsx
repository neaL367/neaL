import React from 'react';
import { Link } from "@/components/link";
import Image, { ImageProps } from "next/image";
import type { MDXComponents } from "mdx/types";

interface MDXElementProps {
    children?: React.ReactNode;
    originalType?: string;
}

function unwrapParagraph(children: React.ReactNode): React.ReactNode {
    const childArray = React.Children.toArray(children);
    if (childArray.length !== 1) return children;

    const firstChild = childArray[0];
    if (React.isValidElement<MDXElementProps>(firstChild)) {
        if (firstChild.type === "p" || firstChild.props.originalType === "p") {
            return firstChild.props.children;
        }
    }
    return children;
}

const components: MDXComponents = {
    h1: ({ children, className, ...props }) => {
        return (
            <h1
                className={`mb-6 scroll-m-20 text-2xl font-bold text-zinc-900 dark:text-zinc-100 ${className || ""}`}
                {...props}
            >
                {unwrapParagraph(children)}
            </h1>
        );
    },
    h2: ({ children, className, ...props }) => {
        return (
            <h2
                className={`mt-12 mb-4 scroll-m-20 text-lg font-medium text-zinc-900 dark:text-zinc-100 ${className || ""}`}
                {...props}
            >
                {unwrapParagraph(children)}
            </h2>
        );
    },
    h3: ({ children, className, ...props }) => {
        return (
            <h3
                className={`mt-8 mb-3 scroll-m-20 text-base font-medium text-zinc-900 dark:text-zinc-100 ${className || ""}`}
                {...props}
            >
                {unwrapParagraph(children)}
            </h3>
        );
    },
    p: ({ children }) => (
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">{children}</p>
    ),
    a: ({ children, href, ...props }) => href ? <Link href={href} {...props}>{children}</Link> : <>{children}</>,
    ul: ({ children }) => (
        <ul className="mb-4 ml-4 list-outside list-disc text-zinc-600 dark:text-zinc-400">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="mb-4 ml-6 list-decimal text-zinc-600 dark:text-zinc-400">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="mb-1 list-inside">{children}</li>,
    blockquote: ({ children }) => (
        <blockquote className="mb-4 border-l-2 border-zinc-300 pl-4 text-sm text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {children}
        </code>
    ),
    pre: ({ children }) => (
        <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
            {children}
        </pre>
    ),
    hr: () => (
        <hr className="relative my-8 h-px w-full overflow-hidden border-0 bg-transparent before:absolute before:left-1/2 before:h-px before:w-[99vw] before:-translate-x-1/2 before:bg-zinc-100 before:content-[''] dark:before:bg-zinc-800" />
    ),
    strong: ({ children }) => <strong className="font-base">{children}</strong>,
    img: (props: ImageProps) => (
        <Image
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            {...props}
            alt={props.alt ?? ""}
        />
    ),
    Link: (props: React.ComponentProps<typeof Link>) => <Link {...props} />,
};

export function useMDXComponents(): MDXComponents {
    return components;
}
