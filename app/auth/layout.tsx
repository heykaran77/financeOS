export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 pt-0 md:p-10 md:pt-0">
      <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
    </div>
  );
}
