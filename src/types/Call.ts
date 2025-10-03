import { Call } from '@stream-io/video-react-sdk';

export interface DBCallData {
  participants: string[];
  description: string;
  duration?: number;
}

export interface CallWithDBData extends Call {
  _dbData?: DBCallData;
}