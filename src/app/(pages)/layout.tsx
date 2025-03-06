import Navigatior from "@/components/navigaitor";

export default function LayoutPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-[90dvh] max-h-full">
      <Navigatior />
      {children}
    </main>
  );
}
