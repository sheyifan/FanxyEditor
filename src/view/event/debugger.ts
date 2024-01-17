import { Document } from '../../data_model/document';
import { Text } from '../../data_model/text'
import { Editor } from '../../ui';
import { Coordinate } from '../layout';

export class DebugHandlerRegister {
    editor: Editor;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    document: Document;

    constructor(editor: Editor) {
        this.editor = editor;
        this.ctx = editor.ctx;
        this.canvas = editor.canvas;
        this.document = editor.document;
    }

    public register() {
        this.ctx.canvas.addEventListener('mousemove', mouseMoveEvent => {
            this.editor.initializeHighDPICanvas();
            this.editor.render();
            let x = mouseMoveEvent.offsetX;
            let y = mouseMoveEvent.offsetY;

            let coordinate = new Coordinate(x, y);
            let line = coordinate.toLine(this.document);
            let paragraph = coordinate.toParagraph(this.document);
            line?.highlight(this.ctx, 0, line.length);
            paragraph?.highlight(this.ctx, 0, paragraph.lines.length);

            if (x > this.editor.userZoneBias
                && y > this.editor.userZoneBias
                && x < this.editor.pageWidth - this.editor.userZoneBias
                && y < this.editor.pageHeight * this.editor.pageCount + (this.editor.pageCount - 1) * this.editor.pageMargin - this.editor.userZoneBias) {
                let promptText = new Text(`x: ${x} y: ${y}`);
                promptText.pack(this.ctx, x, y);
                promptText.render(this.ctx);
            }
        })
        this.ctx.canvas.addEventListener('wheel', _ => {
            this.editor.initializeHighDPICanvas();
            this.editor.render();
        })
    }

    // displayCoordinate = (event) => {

    // }
}