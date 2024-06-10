export interface GridAction {
  actionId: string;
  title?: string;
  icon: string;
  color?: string;
  isConditional?: boolean;
  hideTitle?: boolean;
  // used in detailGrid - row publicId-s for which button is to be rendered
  actionAllowedOn?: string[];
}

export interface ActionEvent {
  actionId: string;
  raw: any;
}
