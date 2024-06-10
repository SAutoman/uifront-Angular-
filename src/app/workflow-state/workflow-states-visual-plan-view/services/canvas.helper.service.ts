import { Injectable } from '@angular/core';
import { Group } from 'fabric/fabric-impl';
declare const fabric: FabricNamespace;
export interface ColorOption {
  key: string;
  label: string;
}

export enum CanvasObjectTypes {
  SELECTION = 'activeSelection',
  GROUP = 'group',
  TEXT = 'i-text',
  IMAGE = 'image',
  RECTANGLE = 'rect',
  CIRCLE = 'circle'
}

export type FabricNamespace = typeof import('fabric').fabric;

@Injectable()
export class CanvasHelperService {
  desktopZoomMessage = 'Scroll to zoom in/out';
  isDragMode: boolean = false;
  isTouchSupported: boolean;

  constructor() {
    this.isTouchSupported = fabric.isTouchSupported;
  }

  setZoomEvent(canvas: fabric.Canvas): void {
    // zooming in/out
    canvas.on('mouse:wheel', (opt) => {
      let delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  setMoveEvents(canvas: fabric.Canvas, isEditMode: boolean): void {
    let lastX;
    let lastY;
    let isDragging;
    if (!this.isTouchSupported) {
      // moving around the canvas => CTRL + mouse left click
      canvas.on('mouse:down', (opt) => {
        if (this.isDragMode) {
          let evt: MouseEvent = opt.e;

          isDragging = true;
          if (isEditMode) {
            canvas.selection = false;
          }
          lastX = evt.clientX;
          lastY = evt.clientY;
        }
      });
      canvas.on('mouse:move', (opt) => {
        if (this.isDragMode && isDragging) {
          let e = opt.e;
          let vpt = canvas.viewportTransform;
          vpt[4] += e.clientX - lastX;
          vpt[5] += e.clientY - lastY;
          canvas.requestRenderAll();
          lastX = e.clientX;
          lastY = e.clientY;
        }
      });
      canvas.on('mouse:up', (opt) => {
        if (this.isDragMode) {
          canvas.setViewportTransform(canvas.viewportTransform);
          isDragging = false;
          if (isEditMode) {
            canvas.selection = true;
          }
        }
      });
    } else {
      canvas.on('touch:drag', (e: any) => {
        if (!canvas.getActiveObject() && this.isDragMode && e.self.x && e.self.y) {
          const currentX = e.self.x;
          const currentY = e.self.y;
          const xChange = currentX - lastX;
          const yChange = currentY - lastY;
          if (Math.abs(currentX - lastX) <= 50 && Math.abs(currentY - lastY) <= 50) {
            let delta = new fabric.Point(xChange, yChange);
            canvas.relativePan(delta);
          }
          lastX = e.self.x;
          lastY = e.self.y;
        }
      });
    }
  }

  zoomOut(canvas: fabric.Canvas): void {
    this.resizeTheCanvasElement(canvas, 100);
  }

  zoomIn(canvas: fabric.Canvas): void {
    this.resizeTheCanvasElement(canvas, -100);
  }

  resizeTheCanvasElement(canvas: fabric.Canvas, value: number): void {
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** value;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: 0, y: 0 }, zoom);
  }

  resetCanvas(canvas: fabric.Canvas, width: number, height: number): void {
    canvas.clear();
    canvas.setBackgroundColor('white', null);
    canvas.setHeight(height);
    canvas.setWidth(width);
    this.resetZoom(canvas);
  }

  resetZoom(canvas: fabric.Canvas): void {
    canvas.setZoom(1);
    canvas.viewportTransform[4] = 0;
    canvas.viewportTransform[5] = 0;
    canvas.requestRenderAll();
  }

  getAllowedColors(): ColorOption[] {
    return [
      {
        key: 'blue',
        label: 'Blue'
      },
      {
        key: 'red',
        label: 'Red'
      },
      {
        key: 'green',
        label: 'Green'
      },
      {
        key: 'yellow',
        label: 'Yellow'
      },
      {
        key: 'black',
        label: 'Black'
      },
      {
        key: 'white',
        label: 'White'
      }
    ];
  }

  colorObjects(color: string, objects: fabric.Object[], colorType: 'fill' | 'stroke'): void {
    objects.forEach((obj) => {
      if (obj.type === CanvasObjectTypes.GROUP) {
        const groupObjects = (<Group>obj).getObjects();
        this.colorObjects(color, groupObjects, colorType);
      } else {
        if (obj.type !== CanvasObjectTypes.TEXT) {
          obj.set({
            [colorType]: color
          });
        }
      }
    });
  }
  setTextOnObjects(objects: fabric.Object[], text: string): void {
    objects.forEach((obj) => {
      if (obj.type === CanvasObjectTypes.GROUP) {
        const groupObjects = (<Group>obj).getObjects();
        this.setTextOnObjects(groupObjects, text);
      } else if (obj.type === CanvasObjectTypes.TEXT) {
        (<fabric.Text>obj).text = text;
      }
    });
  }

  groupHasTextObject(objects: fabric.Object[]): boolean {
    let hasText = false;
    for (let index = 0; index < objects.length; index++) {
      const obj = objects[index];
      if (obj.type === CanvasObjectTypes.GROUP) {
        const groupObjects = (<Group>obj).getObjects();
        hasText = this.groupHasTextObject(groupObjects);
      } else if (obj.type === CanvasObjectTypes.TEXT) {
        hasText = true;
      }
    }
    return hasText;
  }
}
