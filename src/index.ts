import { Editor } from "./ui";

export function main(ctx: CanvasRenderingContext2D) {
    let richEditor = new Editor(ctx);
    // richEditor.writeString("2024 JetBrains google年元首外交开局大国之大，\n在于胸襟大、格局大、担当大。习近平主席开年两场外事活动，彰显中国同世界各国合作共赢、携手构建人类命运共同体的博大胸襟。\n详情 >");
    // richEditor.writeString("B");
    // richEditor.writeString("C");
    // richEditor.writeString("首");
    // richEditor.writeString("元");
    // richEditor.writeLine("2024 JetBrains google年元首外交开局大国之大");
    // richEditor.writeLine("2024 JetBrains google年元首外交开局大国之大");
    // richEditor.writeLine("2024 JetBrains google年元首外交开局大国之大");
    // richEditor.append("Aagbuts年元首外交开局大国\n之大年元首外交开局\n大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大");
    // richEditor.append("年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大");
    // richEditor.append("\nTest\n");
    // richEditor.append("asd");
    richEditor.document.addLast("2024 JetBrains google\n年元首外\n交开局大国之大\n");
    richEditor.document.addLast("大国之大年元首外交开局大国之\n大年元首外交开局大国之大\n");
    richEditor.document.addLast("开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大年元首外交开局大国之大");
    richEditor.document.addLast("Test");
    richEditor.pack();
    richEditor.document.paragraphs.forEach(paragraph => console.log(paragraph));
}

window.onload = function() {
    const westernFont = new FontFace("JetBrains Mono", "url('./style/font/JetBrainsMono-Regular.ttf')")
    westernFont.load().then(() => {
        console.log("Font loaded.")
        let editorCanvas = document.querySelector("#editor") as HTMLCanvasElement;
        let ctx = editorCanvas.getContext("2d") as CanvasRenderingContext2D;
        main(ctx);
    })
}