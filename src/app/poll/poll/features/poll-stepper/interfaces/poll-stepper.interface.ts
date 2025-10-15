type PollStepType = 'choice' | 'phone' | 'tariff'| 'welcome';

export interface PollStepperInterface {
  type: PollStepType;
  fieldName: string;
  question: string;
  answers?: { title?: string; value?: string; comments?:string[]; badge?: string; }[];
  selectedAnswer?: string;
  value?: string;
  valueMessenger?: string;
  required?: boolean;
}

export interface PollStepperAnswerInterface {
  title: string;
   value: string;
}


