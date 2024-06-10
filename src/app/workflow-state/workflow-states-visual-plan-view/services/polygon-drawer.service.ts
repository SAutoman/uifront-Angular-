import { Injectable } from '@angular/core';
import { Canvas, Line, Polygon, Object } from 'fabric/fabric-impl';
import { Guid } from '@wfm/shared/guid';
import { FabricNamespace } from './canvas.helper.service';
declare const fabric: FabricNamespace;

export const defaultFillColor = '#efefef';
export const defaultStrokeColor = 'black';

@Injectable({
  providedIn: 'root'
})
export class PolygonDrawerService {
  min: number;
  max: number;
  polygonMode: boolean;
  pointArray: Array<any>;
  lineArray: Array<any>;
  activeLine: Line;
  activeShape: Polygon;

  constructor() {}

  startPolygon(canvas: Canvas): void {
    this.min = 99;
    this.max = 999999;
    this.polygonMode = true;
    this.pointArray = new Array();
    this.lineArray = new Array();
    this.activeLine = null;
    this.activeShape = null;
    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.name == this.pointArray[0].name) {
        //circle closed, generate polygon
        this.generatePolygon(this.pointArray, canvas);
      }
      if (this.polygonMode) {
        this.addPoint(options, canvas);
      }
    });

    canvas.on('mouse:move', function (options) {
      if (this.activeLine && this.activeLine.class == 'line') {
        const pointer = canvas.getPointer(options.e);
        this.activeLine.set({ x2: pointer.x, y2: pointer.y });

        const points = this.activeShape.get('points');
        points[this.pointArray.length] = {
          x: pointer.x,
          y: pointer.y
        };
        this.activeShape.set({
          points: points
        });
        canvas.renderAll();
      }
      canvas.renderAll();
    });
  }

  addPoint(options, canvas: Canvas): void {
    const random = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    const id = `${new Date().getTime() + random}`;
    const circle = new fabric.Circle({
      radius: 5,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: options.e.layerX / canvas.getZoom(),
      top: options.e.layerY / canvas.getZoom(),
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      name: id,
      objectCaching: false
    });
    if (this.pointArray.length == 0) {
      circle.set({
        fill: 'red'
      });
    }
    const points = [
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom(),
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom()
    ];
    const line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: '#999999',
      stroke: '#999999',
      // class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false
    });
    if (this.activeShape) {
      const pos = canvas.getPointer(options.e);
      const polygonPoints = this.activeShape.get('points');
      polygonPoints.push(new fabric.Point(pos.x, pos.y));
      const polygon = new fabric.Polygon(polygonPoints, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,
        selectable: true,
        hasBorders: true,
        hasControls: true,
        evented: false,
        objectCaching: false
      });
      canvas.remove(this.activeShape);
      canvas.add(polygon);
      this.activeShape = polygon;
      canvas.renderAll();
    } else {
      const polyPoint = [{ x: options.e.layerX / canvas.getZoom(), y: options.e.layerY / canvas.getZoom() }];
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,
        selectable: true,
        // hasBorders: false,
        // hasControls: false,
        evented: false,
        objectCaching: false
      });
      this.activeShape = polygon;
      canvas.add(polygon);
    }
    this.activeLine = line;

    this.pointArray.push(circle);
    this.lineArray.push(line);

    canvas.add(line);
    canvas.add(circle);
    canvas.selection = false;
  }

  generatePolygon(pointArray: any[], canvas: Canvas): void {
    const points = new Array();
    pointArray.forEach((point) => {
      points.push(new fabric.Point(point.left, point.top));
      canvas.remove(point);
    });
    this.lineArray.forEach((line) => {
      canvas.remove(line);
    });
    canvas.remove(this.activeShape).remove(this.activeLine);
    const polygon = new fabric.Polygon(points, {
      stroke: defaultStrokeColor,
      strokeWidth: 0.5,
      fill: defaultFillColor,
      opacity: 1,
      hasBorders: true,
      hasControls: true
    });

    this.addCustomProps(polygon);
    canvas.add(polygon);

    this.activeLine = null;
    this.activeShape = null;
    this.polygonMode = false;
    this.pointArray = new Array();
    this.lineArray = new Array();
    canvas.selection = true;
    canvas.off('mouse:down');
    canvas.off('mouse:move');
  }

  addCustomProps(canvasObject: Object): void {
    canvasObject.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(canvasObject.toObject);

    canvasObject['id'] = Guid.createQuickGuid().toString();
  }
}
