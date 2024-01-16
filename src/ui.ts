import { Text, TextStyle } from './data_model/text'
import { Document, Paragraph, Line, Page } from './data_model/document';
import { Coordinate, Region } from './view/layout';

export class Editor {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    padding = 90;
    pageIndicatorSize = 30;
    pageIndicatorColor = "#aaaaaa";

    pageWidth: number = 1018;
    pageHeight: number = 1318;
    pageMargin = 18;

    pageCount = 2;

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
        this.initializeHighDPICanvas();
        this.renderPagePaddingIndicator();
        this.renderPageMargin();

        this.editPosition.x = this.userZoneBias;
        this.editPosition.y = this.getEditorTopLeftY(0);
        this.caretPosition.x = this.userZoneBias;
        this.caretPosition.y = this.getEditorTopLeftY(0);

        this.document = new Document();

        this.caretSize = 15;

        this.registerEventMessageHandlers();
    }

    private renderCaret() {
        this.ctx.save();
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
        let calibrateY = this.ctx.lineWidth / 2;
        let calibrateHeight = -this.ctx.lineWidth

        this.ctx.beginPath();
        this.ctx.moveTo(this.caretPosition.x, this.caretPosition.y + calibrateY);
        this.ctx.lineTo(this.caretPosition.x, this.caretPosition.y + this.caretSize + calibrateHeight);
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

    private getEditorBottomYFromPage(pageIndex: number) {
        return (pageIndex + 1) * (this.pageHeight + this.pageMargin) - this.padding - this.pageIndicatorSize - 1;
    }

    private getEditorTopLeftY(pageIndex: number) {
        return this.userZoneBias + pageIndex * (this.pageHeight + this.pageMargin);
    }

    private resizeCanvas() {
        console.log(`Page ${this.pageCount}`)
        let width = this.pageWidth;
        let height = this.pageHeight * this.pageCount + (this.pageCount - 1) * this.pageMargin;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    private initializeHighDPICanvas() {
        let width = this.pageWidth;
        let height = this.pageHeight * this.pageCount + (this.pageCount - 1) * this.pageMargin;

        // Actual Pixel size
        this.canvas.width = width * this.devicePixelRatio;
        this.canvas.height = height * this.devicePixelRatio;
        // Visual pixel size
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }

    private renderCanvas() {
        let width = this.pageWidth;
        let height = this.pageHeight * this.pageCount + (this.pageCount - 1) * this.pageMargin;

        // Visual pixel size
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${this.pageHeight}px`
    }

    renderPagePaddingIndicator() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.pageIndicatorColor;

        for (let i = 0 ; i < this.pageCount ; i++) {
            let heightBias = i * (this.pageHeight + this.pageMargin);
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.padding + this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.padding + heightBias);

            this.ctx.moveTo(this.pageWidth - this.padding, this.padding + this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.padding + this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.padding + heightBias);

            this.ctx.moveTo(this.pageWidth - this.padding, this.pageHeight - this.padding - this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.pageHeight - this.padding - this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.pageWidth - this.padding - this.pageIndicatorSize, this.pageHeight - this.padding + heightBias);

            this.ctx.moveTo(this.padding, this.pageHeight - this.padding - this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.pageHeight - this.padding - this.pageIndicatorSize + heightBias);
            this.ctx.lineTo(this.padding + this.pageIndicatorSize, this.pageHeight - this.padding + heightBias);

            this.ctx.stroke();
        }
    }

    private renderPageMargin() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.pageIndicatorColor;

        for (let i = 1 ; i <= this.pageCount - 1 ; i++) {
            let heightBias = i * this.pageHeight + 1;
            this.ctx.fillStyle = "#e6e6e6";
            this.ctx.fillRect(0, heightBias, this.pageWidth, this.pageMargin);
        }
    }

    /**
     * Calculate layout properties 
     */
    pack() {
        /**
         * Break paragraph into several ones if it contains line break character
         */
        const breakParagraphs = () => {
            let changes: { paragraphIndex: number, paragraphs: Paragraph[] }[] = []

            for (let [paragraphIndex, paragraph] of this.document.paragraphs.entries()) {
                let ifContainsLineBreak = paragraph.data
                    .map(text => text.value === '\n')
                    .reduce((previousMatch, nextMatch) => previousMatch || nextMatch);

                let paragraphStartIndex = 0;
                if (ifContainsLineBreak) {
                    let paragraphs = new Array<Paragraph>();
                    for (let [textIndex, text] of paragraph.data.entries()) {
                        if (text.value === '\n') {
                            let newParagraph = new Paragraph();
                            newParagraph.data.push(...paragraph.data.slice(paragraphStartIndex, textIndex));
                            paragraphs.push(newParagraph);
                            paragraphStartIndex = textIndex + 1;
                        }
                        else if (textIndex === paragraph.data.length - 1) {
                            let newParagraph = new Paragraph();
                            newParagraph.data.push(...paragraph.data.slice(paragraphStartIndex, textIndex + 1));
                            paragraphs.push(newParagraph);
                            paragraphStartIndex = textIndex + 1;
                        }
                    }
                    changes.push({
                        paragraphIndex: paragraphIndex,
                        paragraphs: paragraphs
                    })
                }
            }

            for (let change of changes) {
                this.document.paragraphs.splice(change.paragraphIndex, 1, ...change.paragraphs);
            }
        }

        const wrapLines = () => {
            this.document.pages.slice(0, this.document.pages.length);
            let pageIndex = 0;
            this.pageCount = 1;

            for (let [paragraphIndex, paragraph] of this.document.paragraphs.entries()) {
                // Clear all wrapped lines before re-arrange
                paragraph.lines.splice(0, paragraph.lines.length);

                for (let text of paragraph.data) {
                    if (paragraph.lines.length === 0) {
                        // Initial wrapped line
                        let line = new Line();
                        line.lineHeightMultiplier = this.defaultLineHeightMultiplier;
                        paragraph.lines.push(line);
                    }
                    let _lastLine = paragraph.lastLine();

                    // Try pushing one character to the last line of paragraph, and calculate its size
                    _lastLine.push(text);
                    _lastLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);
                    let lastLineHeight = _lastLine.lineHeight;

                    if (_lastLine.width > this.wrapWidth) {
                        _lastLine.pop();
                        _lastLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);

                        let newLine = new Line();
                        newLine.lineHeightMultiplier = this.defaultLineHeightMultiplier;
                        newLine.push(text);
                        this.editPosition.x = this.userZoneBias;
                        this.editPosition.y += lastLineHeight!;
                        newLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);

                        let currentPageEditableBottomY = this.editPosition.y + newLine.lineHeight!;
                        if (this.getEditorBottomYFromPage(pageIndex) < currentPageEditableBottomY) {
                            console.log(this.getEditorBottomYFromPage(pageIndex))
                            pageIndex++;
                            this.pageCount++;
                            this.editPosition.x = this.userZoneBias;
                            this.editPosition.y = this.getEditorTopLeftY(pageIndex);
                            newLine.pack(this.ctx, this.editPosition.x, this.editPosition.y);
                        }
                        
                        console.log(`new line ${this.editPosition.x} ${this.editPosition.y} ${newLine.width} ${newLine.lineHeight!}`)
                        paragraph.lines.push(newLine);
                        if (!this.document.pages[pageIndex]) {
                            this.document.pages[pageIndex] = new Page();
                        }
                        this.document.pages[pageIndex].lines.push(newLine);
                    }
                }

                let _lastLine = paragraph.lastLine();
                this.editPosition.x = this.userZoneBias;
                this.editPosition.y += _lastLine.lineHeight!;
            }
        }

        breakParagraphs();
        wrapLines();
        this.render();
    }

    /**
     * Render all content
     */
    render() {
        this.clear();
        // this.resizeCanvas();
        this.renderPagePaddingIndicator();
        this.renderPageMargin();
        for (let paragraph of this.document.paragraphs) {
            for (let line of paragraph.lines) {
                line.render(this.ctx);
            }
        }
        this.renderCaret();
    }

    /**
     * Clear all content
     */
    clear() {
        let width = this.pageWidth;
        let height = this.pageHeight * this.pageCount + (this.pageCount - 1) * this.pageMargin;

        this.ctx.clearRect(0, 0, width, height);
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
            console.log(`x: ${mouseEvent.offsetX} y: ${mouseEvent.offsetY}`)
            let coordinate = new Coordinate(mouseEvent.offsetX, mouseEvent.offsetY);
            let targetText: Text | undefined = undefined;
            let caretProperty: { size: number | undefined, x: number | undefined, y: number | undefined} = {
                size: undefined, x: undefined, y: undefined
            }
            for (let paragraph of this.document.paragraphs) {
                    
                let paragraphRegion = new Region(paragraph.x, paragraph.y, paragraph.width, paragraph.height);
                if (!coordinate.in(paragraphRegion)) {
                    continue;
                }

                for (let line of paragraph.lines) {
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