export type Message = {
    id: string;
    isUser: boolean;
    text: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'error';
  };
  
  export type CallStatus = 'idle' | 'connecting' | 'ongoing' | 'ended';