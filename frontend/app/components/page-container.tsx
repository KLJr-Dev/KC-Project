export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>;
}
