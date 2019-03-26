export interface IMenuAction {
  order: number;
  label: string;
  action: string;
  icon?: string;
}

export interface IDocument {
  id: number;
  type: string;
  icon: string;
  name: string;
  fileName: string;
  object: string;
  objectName: string;
  createdBy: string;
  changedBy: string;
  changeDate: Date;
  size: string;
  menu: {
    state: string;
    actions: IMenuAction[];
  };
  actions: IMenuAction[];
}

function getData(startId: number, size = 20): IDocument[] {
  const result: IDocument[] = [];
  for (let i = startId; i < size + startId; i++) {
    result.push({
      id: i,
      type: 'word',
      icon: '',
      name: `(${i}) Word document.docx`,
      fileName: `(${i}) Word document.docx`,
      object: 'Matter',
      objectName: 'Cooper',
      createdBy: 'suser',
      changedBy: 'suser',
      changeDate: new Date(),
      size: '5.5 KB',
      menu: {
        state: 'checked in',
        actions: [
          {
            order: 0,
            label: 'download document',
            action: 'download',
          },
          {
            order: 1,
            label: 'rename document',
            action: 'rename',
          },
          {
            order: 2,
            label: 'delete document',
            action: 'delete',
          },
        ],
      },
      actions: [
        {
          order: 0,
          label: 'check out',
          action: 'checkOut',
        },
        {
          order: 1,
          label: 'discard check out',
          action: 'checkOutDiscard',
        },
        {
          order: 1,
          label: 'check in',
          action: 'checkIn',
        },
      ],
    });
  }

  return result;
}

export { getData };
