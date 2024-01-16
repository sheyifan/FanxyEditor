import { Document, Line } from "../data_model/document";

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
            let paragraphRegion = new Region(paragraph.x, paragraph.y, paragraph.width, paragraph.height);
            if (!this.in(paragraphRegion)) {
                continue;
            }

            for (let line of paragraph.lines) {
                let lineRegion = new Region(line.x!, line.y!, line.width, line.lineHeight!);
                if (this.in(lineRegion)) {
                    return line;
                }
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