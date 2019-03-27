import { Component, TemplateRef, Input, ContentChild } from '@angular/core';

@Component({
  selector: 'core-table-column',
  template: ``,
})
export class CoreTableColumnComponent {
  @Input() public name: string;
  @ContentChild('cell') public cell: TemplateRef<any>;
  @ContentChild('header') public header: TemplateRef<any>;
}
