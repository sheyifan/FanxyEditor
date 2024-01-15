import { Text } from "./text";

export class Document extends Array<Page> {
    constructor(...pages: Page[]) {
        super(...pages);
    }
    page(index: number): Page {
        return this[index];
    }
}

export class Page extends Array<Paragraph> {
    private _num: number = -1
    public get num(): number {
        return this._num;
    }
    public set num(lineNumber: number) {
        this._num = lineNumber;
    }
    constructor(...paragraphs: Paragraph[]) {
        super(...paragraphs);
    }
    paragraph(index: number): Paragraph {
        return this[index];
    }
}

export class Paragraph extends Array<Line> {
    private _num: number = -1
    public wrapWidth: number = 1024;
    public get num(): number {
        return this._num;
    }
    public set num(lineNumber: number) {
        this._num = lineNumber;
    }
    constructor(...lines: Line[]) {
        super(...lines);
    }
    line(index: number): Line {
        return this[index];
    }

    public get width(): number {
        if (this.length === 0) {
            return 0;
        }

        return this.map(line => line.width).reduce((previousWidth, nextWidth) => {
            return nextWidth > previousWidth ? nextWidth : previousWidth;
        })!;
    }

    public get height(): number {
        return this.map(line => line.lineHeight).reduce((previousLineHeight, nextLineHeight) => {
            return previousLineHeight! + nextLineHeight!;
        })!;
    }
    public get x(): number {
        return this[0].x!;
    }
    public get y(): number {
        return this[0].y!;
    }
}

export class Line extends Array<Text> {
    private _num: number = -1;
    public lineHeightMultiplier: number = 1;
    public get num(): number {
        return this._num;
    }
    public set num(lineNumber: number) {
        this._num = lineNumber;
    }
    public maxAscent: number | undefined;
    public maxDescent: number | undefined;
    public lineHeight: number | undefined;
    public largest: Text | undefined;

    public x: number | undefined;
    public y: number | undefined;
    public get width(): number {
        if (this.length === 0) {
            return 0;
        }

        return this.map(text => text.layout.width).reduce((previousWidth, nextWidth) => {
            return previousWidth! + nextWidth!;
        })!;
    }

    constructor(...texts: Text[]) {
        super(...texts);
    }
    text(index: number) {
        return this[index];
    }

    pack(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.x = x;
        this.y = y;

        let maxAscent = 0;
        let maxDescent = 0;
        let largestText: Text = new Text("");
        largestText.layout.height = 0; 

        for (let text of this) {
            ctx.font = text.style.font.toString();
            text.textMetrics = ctx.measureText(text.value);
            text.layout.width = text.textMetrics.width;
            text.layout.height = text.textMetrics.actualBoundingBoxAscent + text.textMetrics.actualBoundingBoxDescent;

            if (text.textMetrics.actualBoundingBoxAscent > maxAscent) {
                maxAscent = text.textMetrics.actualBoundingBoxAscent;
            }
            if (text.textMetrics.actualBoundingBoxDescent > maxDescent) {
                maxDescent = text.textMetrics.actualBoundingBoxDescent;
            }
            if (text.layout.height > largestText.layout.height!) {
                largestText = text;
            }
        }

        this.maxAscent = maxAscent;
        this.maxDescent = maxDescent;
        this.lineHeight = (maxAscent + maxDescent) * this.lineHeightMultiplier;
        this.largest = largestText;

        for (let text of this) {
            // Canvas use alphabetic baseline as default, see HTML5 TextMetrics for more details
            text.pack(ctx, x, y + this.maxAscent);
            x += text.layout.width!;
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let text of this) {
            text.render(ctx);
        }
    }

    clear(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#00ff0033";
        ctx.clearRect(this.x!, this.y!, this.width, this.lineHeight!);
    }

    stroke(ctx: CanvasRenderingContext2D, startIndex: number, endIndex: number) {
        if (endIndex <= startIndex) {
            return;
        }

        for (let i = 0 ; i < endIndex ; i++) {
            let text = this[i];
            ctx.font = text.style.font.toString();
            
            if (i >= startIndex) {
                ctx.beginPath();
                ctx.strokeStyle = text.style.color;
                // middle Y value of this text
                let middleY = this.y! + (this.maxAscent! + this.maxDescent!) / 2;
                ctx.moveTo(text.layout.x!, middleY);
                ctx.lineTo(text.layout.x! + text.layout.width!, middleY);
                ctx.stroke();
            }
        }
    }

    highlight(ctx: CanvasRenderingContext2D, startIndex: number, endIndex: number) {
        if (endIndex <= startIndex) {
            return;
        }

        for (let i = 0 ; i < endIndex ; i++) {
            let text = this[i];
            ctx.font = text.style.font.toString();
            
            if (i >= startIndex) {
                ctx.fillStyle = "#ff000033";
                ctx.fillRect(text.layout.x!, text.layout.y! - this.maxAscent!, text.layout.width!, this.maxAscent! + this.maxDescent!);
            }
        }
    }
}