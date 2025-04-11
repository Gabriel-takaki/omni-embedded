/**
 * Created by filipe on 17/09/16.
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {roundPoint, formatNumber} from '../../modules/funnel-graph-js/number.js';
import {createPath, createVerticalPath} from '../../modules/funnel-graph-js/path.js';
import {createSVGElement, setAttrs, removeAttrs} from '../../modules/funnel-graph-js/graph.js';
import generateRandomIdString from '../../modules/funnel-graph-js/random.js';
import {StatusService} from "../services/status.service";

@Component({
  selector: 'app-funnel-chart',
  templateUrl: 'funnel-chart.component.html',
  styleUrls: ['funnel-chart.component.scss']
})
export class FunnelChartComponent implements AfterViewInit, OnChanges {

  @Input() data: { name: string, total: number, won: number, lost: number, mtc: number }[] = [];
  @Input() colors: string[] = [this.status.primaryColor];
  @Input() fillMode: string = 'gradient';
  @ViewChild('svgFunnel') svgFunnel: ElementRef<HTMLDivElement>;

  initialized = false;

  values = [];

  constructor(public status: StatusService) {

  }

  ngAfterViewInit() {
    this.calculateValues();
    this.draw();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
      this.updateData();
    }
  }

  calculateValues() {
    this.values = [];
    for (const pipe of this.data) {
      this.values.push(pipe.total);
    }
  }

  calculatePercentage(value) {
    return Math.round((value / (this.data[0].total || 1)) * 100);
  }

  calculateWonPercentage(stage) {
    return Math.round((stage.won / ((stage.won + stage.lost) || 1)) * 100);
  }

  calculateLostPercentage(stage) {
    return Math.round((stage.lost / ((stage.won + stage.lost) || 1)) * 100);
  }

  getWidth() {
    return this.svgFunnel.nativeElement.clientWidth;
  }

  getHeight() {
    return this.svgFunnel.nativeElement.clientHeight;
  }


  getFullDimension() {
    // return this.isVertical() ? this.getWidth() : this.getHeight();
    return this.getHeight();
  }

  getCrossAxisPoints() {
    const points = [];
    const fullDimension = this.getFullDimension();
    // get half of the graph container height or width, since funnel shape is symmetric
    // we use this when calculating the "A" shape
    const dimension = fullDimension / 2;
    // if (this.is2d()) {
    //   const totalValues = this.getValues2d();
    //   const max = Math.max(...totalValues);
    //
    //   // duplicate last value
    //   totalValues.push([...totalValues].pop());
    //   // get points for path "A"
    //   points.push(totalValues.map(value => roundPoint((max - value) / max * dimension)));
    //   // percentages with duplicated last value
    //   const percentagesFull = this.getPercentages2d();
    //   const pointsOfFirstPath = points[0];
    //
    //   for (let i = 1; i < this.getSubDataSize(); i++) {
    //     const p = points[i - 1];
    //     const newPoints = [];
    //
    //     for (let j = 0; j < this.getDataSize(); j++) {
    //       newPoints.push(roundPoint(
    //           // eslint-disable-next-line comma-dangle
    //           p[j] + (fullDimension - pointsOfFirstPath[j] * 2) * (percentagesFull[j][i - 1] / 100)
    //       ));
    //     }
    //
    //     // duplicate the last value as points #2 and #3 have the same value on the cross axis
    //     newPoints.push([...newPoints].pop());
    //     points.push(newPoints);
    //   }
    //
    //   // add points for path "D", that is simply the "inverted" path "A"
    //   points.push(pointsOfFirstPath.map(point => fullDimension - point));
    // } else {
    // As you can see on the visualization above points #2 and #3 have the same cross axis coordinate
    // so we duplicate the last value
    const max = Math.max(...this.values);
    const values = [...this.values].concat([...this.values].pop());
    // if the graph is simple (not two-dimensional) then we have only paths "A" and "D"
    // which are symmetric. So we get the points for "A" and then get points for "D" by subtracting "A"
    // points from graph cross dimension length
    points.push(values.map(value => roundPoint((max - value) / max * dimension)));
    points.push(points[0].map(point => fullDimension - point));
    // }

    return points;
  }

  makeSVG() {

    const svg = createSVGElement('svg', this.svgFunnel.nativeElement, {
      width: this.getWidth(),
      height: this.getHeight()
    });

    // console.log('construindo svg', this.data);

    const valuesNum = this.getCrossAxisPoints().length - 1;
    for (let i = 0; i < valuesNum; i++) {
      const path = createSVGElement('path', svg);

      const color = this.colors;
      const fillMode = this.fillMode;

      if (fillMode === 'solid') {
        setAttrs(path, {
          fill: color[0],
          stroke: color[0]
        });
      } else if (fillMode === 'gradient') {
        this.applyGradient(svg, path, color, i + 1);
      }

      svg.appendChild(path);
    }

    this.svgFunnel.nativeElement.appendChild(svg);
  }


  applyGradient(svg, path, colors, index) {
    const defs = (svg.querySelector('defs') === null)
      ? createSVGElement('defs', svg)
      : svg.querySelector('defs');

    const gradientName = generateRandomIdString(`funnelGradient-${index}-`);

    const gradient = createSVGElement('linearGradient', defs, {
      id: gradientName
    });
    //
    // if (this.gradientDirection === 'vertical') {
    //   setAttrs(gradient, {
    //     x1: '0',
    //     x2: '0',
    //     y1: '0',
    //     y2: '1'
    //   });
    // }

    const numberOfColors = colors.length;

    for (let i = 0; i < numberOfColors; i++) {
      createSVGElement('stop', gradient, {
        'stop-color': colors[i],
        offset: `${Math.round(100 * i / (numberOfColors - 1))}%`
      });
    }

    setAttrs(path, {
      fill: `url("#${gradientName}")`,
      stroke: `url("#${gradientName}")`
    });
  }

  getSVG() {
    const svg = this.svgFunnel.nativeElement.querySelector('svg');

    if (!svg) {
      throw new Error('No SVG found inside of the container');
    }

    return svg;
  }

  updateData() {
    this.calculateValues();
    this.svgFunnel?.nativeElement?.querySelector('svg')?.remove();
    this.draw();
  }

  getPathDefinitions() {
    const valuesNum = this.getCrossAxisPoints().length - 1;
    const paths = [];
    for (let i = 0; i < valuesNum; i++) {
      // if (this.isVertical()) {
      //   const X = this.getCrossAxisPoints()[i];
      //   const XNext = this.getCrossAxisPoints()[i + 1];
      //   const Y = this.getMainAxisPoints();
      //
      //   const d = createVerticalPath(i, X, XNext, Y);
      //   paths.push(d);
      // } else {
      const X = this.getMainAxisPoints();
      const Y = this.getCrossAxisPoints()[i];
      const YNext = this.getCrossAxisPoints()[i + 1];

      const d = createPath(i, X, Y, YNext);
      paths.push(d);
      // }
    }

    return paths;
  }


  getDataSize() {
    return this.values.length;
  }

  getMainAxisPoints() {
    const size = this.getDataSize();
    const points = [];
    const fullDimension = this.getWidth();
    for (let i = 0; i <= size; i++) {
      points.push(roundPoint(fullDimension * i / size));
    }
    return points;
  }

  drawPaths() {
    const svg = this.getSVG();
    const paths = svg.querySelectorAll('path');
    const definitions = this.getPathDefinitions();

    definitions.forEach((definition, index) => {
      paths[index].setAttribute('d', definition);
    });
  }

  draw() {
    if (!this.data.length) {
      return;
    }
    this.makeSVG();
    this.drawPaths();
  }

}
