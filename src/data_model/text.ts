import { Layout } from "../view/layout";

export class Font extends Object {
    weight: number;
    fontSize: number;
    fontFamily: string;

    constructor(weight = 500, fontSize = 15, fontFamily = "JetBrains Mono") {
        super();
        this.weight = weight;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
    }

    override toString(): string {
        return `${this.weight} ${this.fontSize}px ${this.fontFamily}`;
    }
}

export class TextStyle extends Object {
    color: string;
    isHighlighted: boolean;
    backgroundColor: string;
    isStrikeThrough: boolean;
    isItalic: boolean;
    isUnderlined: boolean;

    font: Font;

    constructor(color = "#000000", isHighlighted = false, backgroundColor = "#000000") {
        super();
        this.color = color;
        this.isHighlighted = isHighlighted;
        this.backgroundColor = backgroundColor;
        this.isStrikeThrough = true;
        this.isItalic = false;
        this.isUnderlined = false;

        this.font = new Font();
    }
}

export class Text extends Object {
    public style: TextStyle;

    private _value : string;
    public get value() : string {
        return this._value;
    }
    public set value(v : string) {
        this._value = v;
    }

    public layout: Layout;
    public textMetrics: TextMetrics | undefined;

    constructor(value: string, textStyle: TextStyle = new TextStyle()) {
        super();
        this._value = value;
        this.style = textStyle;
        this.layout = new Layout();
    }

    /**
     * Calculate size properties, before shown on screen
     * @param ctx Canvas context
     * @param textX x coordinate where we rendering text
     * @param textY y coordinate where we rendering text
     */
    pack(ctx: CanvasRenderingContext2D, textX: number, textY: number) {
        ctx.font = this.style.font.toString();
        this.textMetrics = ctx.measureText(this.value);
        this.layout.x = textX;
        this.layout.y = textY;
        this.layout.width = this.textMetrics.width;
        this.layout.height = this.textMetrics.actualBoundingBoxAscent + this.textMetrics.actualBoundingBoxDescent;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.style.color;
        ctx.fillText(this.value, this.layout.x!, this.layout.y!);
    }
}