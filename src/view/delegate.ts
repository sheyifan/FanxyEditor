import { Editor } from "../ui";
import { Coordinate, Layout, Region } from "./layout";

export const textCursorHandler = (event: MouseEvent, editor: Editor) => {
    let coordinate = new Coordinate(event.offsetX, event.offsetY);
    let ifShownTextCursor = false;

    for (let paragraph of editor.document.paragraphs) {
        for (let line of paragraph.lines) {
            let lineRegion = new Region(line.x!, line.y!, line.width, line.lineHeight!);
            if ((coordinate.in(lineRegion!) || coordinate.before(lineRegion!) || coordinate.after(lineRegion!))
                && (coordinate.x! >= editor.userZoneBias
                && coordinate.x! <= editor.pageWidth - editor.userZoneBias)) {
                ifShownTextCursor = true;
            }
        }
    }

    if (ifShownTextCursor) {
        editor.canvas.style.cursor = "text";
    }
    else {
        editor.canvas.style.cursor = "auto";
    }
}