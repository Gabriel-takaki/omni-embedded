/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Meta, Title} from "@angular/platform-browser";
import {StatusService} from "./status.service";
import {Color} from "../base.component";
import tinycolor from "tinycolor2";

@Injectable({providedIn: 'root'})
export class StyleService {

  initialized = false;

  constructor(private meta: Meta, private http: HttpClient, private titleService: Title, private status: StatusService) {

    status.iconPrefix = meta.getTag('name=iconprefix')?.content || '';

  }

  initialize() {
    if (this.initialized || !this.status.iconPrefix) {
      return;
    }
    this.initialized = true;
    this.http.get(`https://static-styles.atenderbem.com/${this.status.iconPrefix}/config.json`).subscribe((r: any) => {
      if (r?.primaryColor) {
        this.titleService.setTitle(r.title);

        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--header-color', r.headerColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--primary-color', r.primaryColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--secondary-color', r.headerSelectedColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--primary-fg-color', r.primaryFgColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--primary-bg-color', r.primaryBgColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--header-fg-color', r.headerFgColor);
        // @ts-ignore
        document?.querySelector(':root')?.style?.setProperty('--header-alert-color', r.headerAlertColor);

        this.status.headerColor = r.headerColor || this.status.headerColor;
        this.status.primaryColor = r.primaryColor || this.status.primaryColor;
        this.status.primaryFgColor = r.primaryFgColor || this.status.primaryFgColor;
        this.status.headerAlertColor = r.headerAlertColor || this.status.headerAlertColor;
        this.status.primaryBgColor = r.primaryBgColor || this.status.primaryBgColor;
        this.status.secondaryColor = r.headerSelectedColor || this.status.secondaryColor;
        this.status.headerFontColor = r.headerFgColor || this.status.headerFontColor;
        this.status.gradientColor1 = r.gradientColor1 || r.chartColor1;
        this.status.gradientColor2 = r.gradientColor2 || r.chartColor2;
        this.status.gradientColor3 = r.gradientColor3 || r.chartColor3;

        // @ts-ignore
        if (window.kwChat) {
          // @ts-ignore
          const kwChat: any = window.kwChat;
          kwChat.config.selectedMenuFgColor = r.primaryColor;
          kwChat.config.headerBgColor = r.headerColor;
          kwChat.config.headerFgColor = r.headerFgColor;
          kwChat.config.gradientColor1 = r.headerColor + ' 0%';
          kwChat.config.gradientColor2 = tinycolor(r.headerColor).lighten(26) + ' 85%';
          kwChat.config.gradientColor3 = tinycolor(r.headerColor).lighten(52) + ' 100%';
        }

        if (r?.chartColor1) {
          this.status.chartColors = [];

          this.status.chartColors.push(r.chartColor1);
          this.status.chartColors.push(r.chartColor2);
          this.status.chartColors.push(r.chartColor3);
          this.status.chartColors.push(r.chartColor4);
          this.status.chartColors.push(r.chartColor5);
          this.status.chartColors.push(r.chartColor6);
        }

        this.savePrimaryColor();
        this.saveAccentColor();

      }
    });
  }

  savePrimaryColor() {
    updateTheme(computeColors(this.status.primaryColor), 'primary');
  }

  saveAccentColor() {
    updateTheme(computeColors(this.status.secondaryColor), 'accent');
  }

  getBackgroundLigthenColor(color = '#565656') {
    return tinycolor(color).lighten(52).toHexString();
  }

}

function updateTheme(colors: Color[], theme: string) {
  colors.forEach(color => {
    document.documentElement.style.setProperty(
      `--theme-${theme}-${color.name}`,
      color.hex
    );
    document.documentElement.style.setProperty(
      `--theme-${theme}-contrast-${color.name}`,
      color.darkContrast ? 'rgba(black, 0.87)' : 'white'
    );
  });
}

function computeColors(hex: string): Color[] {
  return [
    getColorObject(tinycolor(hex).lighten(52), '50'),
    getColorObject(tinycolor(hex).lighten(37), '100'),
    getColorObject(tinycolor(hex).lighten(26), '200'),
    getColorObject(tinycolor(hex).lighten(12), '300'),
    getColorObject(tinycolor(hex).lighten(6), '400'),
    getColorObject(tinycolor(hex), '500'),
    getColorObject(tinycolor(hex).darken(6), '600'),
    getColorObject(tinycolor(hex).darken(12), '700'),
    getColorObject(tinycolor(hex).darken(18), '800'),
    getColorObject(tinycolor(hex).darken(24), '900'),
    getColorObject(tinycolor(hex).lighten(50).saturate(30), 'A100'),
    getColorObject(tinycolor(hex).lighten(30).saturate(30), 'A200'),
    getColorObject(tinycolor(hex).lighten(10).saturate(15), 'A400'),
    getColorObject(tinycolor(hex).lighten(5).saturate(5), 'A700')
  ];
}

function getColorObject(value, name): Color {
  const c = tinycolor(value);
  return {
    name: name,
    hex: c.toHexString(),
    darkContrast: c.isLight()
  };
}


