import { ReactNode } from 'react';
import StreamVideoProvider from '@/providers/StreamClientProvider';

const MeetingLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <StreamVideoProvider>
      {children}
    </StreamVideoProvider>
  );
};

export default MeetingLayout;
