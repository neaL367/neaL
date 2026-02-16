import { ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <ViewTransition enter="page-enter" exit="page-exit duration-100">
            {children}
        </ViewTransition>
    );
}