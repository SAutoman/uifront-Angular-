import { Component, Input, OnInit } from '@angular/core';
import { Canvas, Object } from 'fabric/fabric-impl';
import { CanvasHelperService, CanvasObjectTypes, ColorOption } from '../../services/canvas.helper.service';

@Component({
  selector: 'app-plan-unit-properties',
  templateUrl: './plan-unit-properties.component.html',
  styleUrls: ['./plan-unit-properties.component.scss']
})
export class PlanUnitPropertiesComponent implements OnInit {
  @Input() selection: Object;
  @Input() canvas: Canvas;

  fontFamilyOptions: string[] = [
    'Times New Roman',
    'Arial',
    'Nunito Sans',
    'Courier New'
    // 'Verdana',
    // 'Tahoma',
    // 'Trebuchet MS',
    // 'Georgia',
    // 'Garamond',
    // 'Brush Script MT'
  ];

  fontStyleOptions: string[] = ['normal', 'italic', 'oblique'];

  colorOptions: ColorOption[];

  get canvasObjectTypes() {
    return CanvasObjectTypes;
  }

  constructor(private canvasHelper: CanvasHelperService) {}

  ngOnInit() {
    this.colorOptions = this.canvasHelper.getAllowedColors();
  }

  updateSelection(newValue: string, propName: keyof Object): void {
    this.selection.set(propName, newValue);
    this.selection.setCoords();
    this.canvas.requestRenderAll();
  }

  updateProperty(newValue: number, propName: keyof Object): void {
    this.selection.set(propName, +newValue);
    this.selection.setCoords();

    this.canvas.requestRenderAll();
  }
}
