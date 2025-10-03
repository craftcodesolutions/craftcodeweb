import { Call, CallState } from '@stream-io/video-react-sdk';

export interface StreamCallCustomData {
  description?: string;
  participants?: string[];
  createdBy?: string;
  meetingType?: 'instant' | 'scheduled';
  title?: string;
}

export interface StreamCallState extends Omit<CallState, 'custom'> {
  custom: StreamCallCustomData & Record<string, unknown>;
}

export interface StreamCallWithCustomState extends Omit<Call, 'state'> {
  state: StreamCallState;
  _dbData?: StreamCallCustomData;
}