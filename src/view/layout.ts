import { Document, Line, Paragraph } from "../data_model/document";
import { Text } from "../data_model/text";

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

    textIndexInParagraph(document: Document): number | undefined {
        let line = this.toLine(document);
        let maxLineAscent = line?.maxAscent;
        let lineHeight = line?.lineHeight;
        let textIndex = undefined;
        line?.forEach((text, index) => {
            let textRegion = new Region(
                <number>text.layout.x, <number>text.layout.y - <number>maxLineAscent,
                <number>text.layout.width, <number>lineHeight);
            if (this.in(textRegion)) {
                textIndex = index;
            }
        });
        return textIndex;
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