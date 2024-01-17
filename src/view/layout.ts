import { Document, Line, Paragraph } from "../data_model/document";

export class Coordinate {
    x: number | undefined = undefined;
    y: number | undefined = undefined;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    in(region: Layout): boolean {
        if (this.x! >= region.x! && this.y! > region.y! && this.x! <= (region.x! + region.width!) && this.y! <= (region.y! + region.height!)) {
            return true;
        } else {
            return false;
        }
    }

    toLine(document: Document): Line | undefined {
        for (let paragraph of document.paragraphs) {
            for (let line of paragraph.lines) {
                let lineRegion = new Region(line.x!, line.y!, line.width, line.lineHeight!);
                if (this.in(lineRegion)) {
                    return line;
                }
            }
        }
    }

    toParagraph(document: Document): Paragraph | undefined {
        for (let paragraph of document.paragraphs) {          
            let isIn = false;
            for (let line of paragraph.lines) {
                let lineRegion = new Region(line.x!, line.y!, line.width, line.lineHeight!);
                if (this.in(lineRegion)) {
                    isIn = true;
                }
            }
            if (isIn) {
                return paragraph;
            }
        }
    }
}

export class Region {
    x: number;
    y: number | undefined = undefined;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class Layout {
    x: number | undefined = undefined;
    y: number | undefined = undefined;
    width: number | undefined = undefined;
    height: number | undefined = undefined;
}