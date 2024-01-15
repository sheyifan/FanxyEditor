import { Text, TextStyle } from './data_model/text'
import { Document, Page, Paragraph, Line } from './data_model/document';
import { Coordinate, Region } from './view/layout';

export class Editor {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    padding = 90;
    pageIndicatorSize = 30;
    pageIndicatorColor = "#aaaaaa";

    pageWidth: number = 1018;
    pageHeight: number = 1318;

    editPosition = {
        x: 0,
        y: 0
    }

    caretPosition = {
        x: 0,
        y: 0
    }
    caretSize: number;

    private userZoneBias = this.padding + this.pageIndicatorSize + 1;
    public wrapWidth: number = this.pageWidth - 2 * (this.padding + this.pageIndicatorSize + 1);

    style = new TextStyle();

    document: Document;
    defaultLineHeightMultiplier: number = 2.0;
    devicePixelRatio: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.devicePixelRatio = window.devicePixelRatio;

        this.canvas = ctx.canvas;
        this.scaleForHighDPI();

        this.editPosition.x = this.userZoneBias;
        this.editPosition.y = this.userZoneBias;
        this.caretPosition.x = this.userZoneBias;
        this.caretPosition.y = this.userZoneBias;

        let line = new Line();
        line.lineHeightMultiplier = this.defaultLineHeightMultiplier;
        let paragraph = new Paragraph(line);
        paragraph.wrapWidth = this.wrapWidth;
        let initialPage = new Page(paragraph);
        this.document = new Document(initialPage);

        this.caretSize = 15;

        this.registerEventMessageHandlers();
    }

    private renderCaret() {
        this.ctx.save();
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        this.ctx.moveTo(this.caretPosition.x, this.caretPosition.y);
        this.ctx.lineTo(this.caretPosition.x, this.caretPosition.y + this.caretSize);
        this.ctx.stroke();

        this.ctx.restore();
    }

    private clearCaret() {
        this.ctx.clearRect(this.caretPosition.x - this.ctx.lineWidth, this.caretPosition.y, 2, this.caretSize);
        // Re-display text hidden by caret
        let line = new Coordinate(this.caretPosition.x, this.caretPosition.y + this.caretSize / 2).toLine(this.document);
        line?.clear(this.ctx);
        line?.render(this.ctx);
    }

    scaleForHighDPI() {
        this.canvas.width = this.pageWidth * this.devicePixelRatio;
        this.canvas.height = this.pageHeight * this.devicePixelRatio;
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }

    renderPagePaddingIndicator() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.pageIndicatorColor;

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding + this.pageIndicatorSize);
        this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.padding + this.pageIndicatorSize);
        this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.padding);

        this.ctx.moveTo(this.pageWidth - this.padding, this.padding + this.pageIndicatorSize);
        this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.padding + this.pageIndicatorSize);
        this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.padding);

        this.ctx.moveTo(this.pageWidth - this.padding, this.pageHeight - this.padding - this.pageIndicatorSize);
        this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.pageHeight - this.padding - this.pageIndicatorSize);
        this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.pageHeight - this.padding);

        this.ctx.moveTo(this.padding, this.pageHeight - this.padding - this.pageIndicatorSize);
        this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.pageHeight - this.padding - this.pageIndicatorSize);
        this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.pageHeight - this.padding);

        this.ctx.stroke();
    }

    writeParagraph(paragraphString: string) {
        let paragraph = new Paragraph();
        
    }

    append(anyString: string) {
        for (let c of anyString) {
            let text = new Text(c);
            let _lastPage = this.document[this.document.length - 1];
            let _lastParagraph = _lastPage[_lastPage.length - 1];
            let _lastLine = _lastParagraph[_lastParagraph.length - 1];
            _lastLine.push(text);
            _lastLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);
            let lastLineHeight = _lastLine.lineHeight;

            if (text.value === '\n') {
                _lastLine.push(text);
                let paragraph = new Paragraph();
                _lastPage.push(paragraph);
                let newLine = new Line();
                newLine.lineHeightMultiplier = this.defaultLineHeightMultiplier;
                paragraph.push(newLine);
                this.editPosition.y += lastLineHeight!;
                newLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);
                continue;
            }

            if (_lastLine.width > this.wrapWidth) {
                _lastLine.pop();
                _lastLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);

                let newLine = new Line();
                newLine.lineHeightMultiplier = this.defaultLineHeightMultiplier;
                _lastParagraph.push(newLine);
                newLine.push(text);
                this.editPosition.y += lastLineHeight!;
                newLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);
            }
        }
        this.clear();
        this.render();
    }

    render() {
        for (let page of this.document) {
            for (let paragraph of page) {
                for (let line of paragraph) {
                    line.render(this.ctx);
                }
            }
        }
        let _lastPage = this.document[this.document.length - 1];
        let _lastParagraph = _lastPage[_lastPage.length - 1];
        let _lastLine = _lastParagraph[_lastParagraph.length - 1];
        this.renderCaret();
    }

    writeString(char: string) {
        let x = this.editPosition.x;
        let y = this.editPosition.y;

        let lines: Line[] = [];
        let charLines = char.split("\n");

        for (let char of charLines) {
            let lastLine = new Line();
            lastLine.lineHeightMultiplier = 1.7;
            lines.push(lastLine);
            for (let c of char) {
                let text = new Text(c);
                text.textMetrics = this.ctx.measureText(c);
                text.layout.width = text.textMetrics.width;
                text.layout.height = text.textMetrics.actualBoundingBoxAscent + text.textMetrics.actualBoundingBoxDescent;
    
                lastLine.push(text);
    
                if (this.editPosition.x + text.layout.width > this.pageWidth - this.padding - this.pageIndicatorSize) {
                    this.editPosition.x = this.padding + this.pageIndicatorSize;
                    this.editPosition.y += lastLine.lineHeight!;
                }
    
                text.pack(this.ctx, this.editPosition.x, this.editPosition.y);
                this.editPosition.x += text.layout.width;
            }
            this.editPosition.x = this.padding + this.pageIndicatorSize;
            this.editPosition.y += lastLine.lineHeight!;
        }

        for (let line of lines) {
            line.render(this.ctx);
        }

        // this.ctx.fillStyle = "#ff000033";
        // this.ctx.moveTo(x, y);
        // this.ctx.fillRect(x, y, lines[0].width, lines[0].height);
    }

    clear() {
        this.ctx.clearRect(
            this.padding + this.pageIndicatorSize,
            this.padding + this.pageIndicatorSize,
            this.pageWidth - 2 * this.padding - 2 * this.pageIndicatorSize,
            this.pageHeight - 2 * this.padding - 2* this.pageIndicatorSize);
    }

    registerEventMessageHandlers() {
        let caretShown = false;

        setInterval(() => {
            if (!caretShown) {
                this.renderCaret();
                caretShown = !caretShown;
            }
            else {
                this.clearCaret();
                caretShown = !caretShown;
            }
        }, 500);

        this.canvas.addEventListener('mousedown', mouseEvent => {
            let coordinate = new Coordinate(mouseEvent.offsetX, mouseEvent.offsetY);
            let targetText: Text | undefined = undefined;
            let caretProperty: { size: number | undefined, x: number | undefined, y: number | undefined} = {
                size: undefined, x: undefined, y: undefined
            }
            for (let page of this.document) {
                for (let paragraph of page) {
                    
                    let paragraphRegion = new Region(paragraph.x, paragraph.y, paragraph.width, paragraph.height);
                    if (!coordinate.in(paragraphRegion)) {
                        continue;
                    }

                    for (let line of paragraph) {
                        let lineRegion = new Region(line.x!, line.y!, line.width, line.lineHeight!);
                        if (!coordinate.in(lineRegion)) {
                            continue;
                        }
                        for (let text of line) {
                            let textRegion = new Region(text.layout.x!, line.y!, text.layout.width!, line.maxAscent! + line.maxDescent!);
                            if (coordinate.in(textRegion)) {
                                targetText = text;
                                caretProperty.size = line.maxAscent! + line.maxDescent!;
                                caretProperty.x = text.layout.x;
                                caretProperty.y = line.y;
                            }
                        }
                    }
                }
            }
            
            if (targetText) {
                let x = targetText?.layout.x!
                let y = caretProperty.y!;
                let height = caretProperty.size;

                this.clearCaret();
                caretShown = false;
                this.caretPosition.x = x;
                this.caretPosition.y = y;
                this.caretSize = height!;
            }
        })
    }
}