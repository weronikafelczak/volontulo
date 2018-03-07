export interface Action {
  result: any;
}

export interface SuccessOrFailureAction extends Action {
  result: 'success' | 'failure'
  message?: string;
}

export interface FileReaderEventTarget extends EventTarget {
  result:string
}

export interface FileReaderEvent extends ProgressEvent {
  target: FileReaderEventTarget;
  getMessage():string;
}