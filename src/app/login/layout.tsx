import { GlobalErrorMessenger } from '@/components/common/GlobalErrorMessenger';

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <GlobalErrorMessenger />
      {children}
    </>
  );
}
