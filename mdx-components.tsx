import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { Link } from "next-view-transitions";

const colorClasses = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-purple-600 dark:text-purple-400",
  success: "text-green-600 dark:text-green-400",
  danger: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-cyan-600 dark:text-cyan-400",
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 text-gradient-to-r from-pink-500 to-yellow-500 font-sans">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold mb-5 text-gradient-to-r from-purple-500 to-blue-500 font-sans">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-medium mb-4 text-gradient-to-r from-green-500 to-cyan-500 font-sans">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-medium mb-3 text-orange-600 dark:text-orange-400 font-sans">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-medium mb-2 text-indigo-600 dark:text-indigo-400 font-sans">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-medium mb-2 text-teal-600 dark:text-teal-400 font-sans">
        {children}
      </h6>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-black dark:text-white font-sans">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-black dark:text-white font-sans">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-2 marker:text-gray-600 dark:marker:text-gray-400">
        {children}
      </li>
    ),
    p: ({ children }) => (
      <p className="mb-6 text-black dark:text-white leading-relaxed font-sans">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
    ),
    del: ({ children }) => (
      <del className="line-through text-red-500 dark:text-red-400">{children}</del>
    ),
    a: ({ href, children }) => (
      <Link
        href={href}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline font-sans"
      >
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic mb-6 text-gray-700 dark:text-gray-300 font-sans">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-black dark:text-white">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 mb-6 overflow-x-auto font-mono text-black dark:text-white border border-gray-200 dark:border-gray-700">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 font-sans">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-900">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white divide-y divide-gray-100 dark:bg-black dark:divide-gray-800">
        {children}
      </tbody>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
        {children}
      </td>
    ),
    img: (props) => (
      <Image
        {...props}
        width={600}
        height={400}
        className="rounded-lg shadow-md mb-6"
        alt={props.alt || "MDX content image"}
      />
    ),
    hr: () => <hr className="border-t border-gray-300 dark:border-gray-700 my-8" />,
    Primary: ({ children }) => <span className={colorClasses.primary}>{children}</span>,
    Secondary: ({ children }) => <span className={colorClasses.secondary}>{children}</span>,
    Success: ({ children }) => <span className={colorClasses.success}>{children}</span>,
    Danger: ({ children }) => <span className={colorClasses.danger}>{children}</span>,
    Warning: ({ children }) => <span className={colorClasses.warning}>{children}</span>,
    Info: ({ children }) => <span className={colorClasses.info}>{children}</span>,
    ...components,
  };
}

