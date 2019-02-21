import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from "@angular/cdk/scrolling";
import { Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableVirtualScrollStrategy } from './table-vs-strategy.service';

function createData(startId: number, size: number = 20) {
  const result = [];
  for (let i = startId; i < (size + startId); i++) {
    result.push({position: i, name: 'Hydrogen', weight: 1.0079, symbol: 'H'});
  }
  return result;
}

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  
  headerPosition = '';
  scrollPosition = 0;
  offset = new BehaviorSubject(0);
  rows = new BehaviorSubject([])
  
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  dataSource: Observable<Array<any>>;

  gridHeight = 400;

  @ViewChild('viewport') viewport: any;

  constructor() {}

  public ngOnInit() {
    this.offset.subscribe(id => {
      this.rows.next([...this.rows.getValue(), ...createData(id)])
    });

    this.dataSource = combineLatest([this.rows, this.viewport.renderedRangeStream]).pipe(
      map((value: any) => {
        return value[0].slice(value[1].start, value[1].end);
      })
    );
  }

  nextBatch(e) {
    this.scrollPosition = -this.viewport.getOffsetToRenderedContentStart();
    
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    
    if(end === total) {
      this.offset.next(end);
    }
  }
}