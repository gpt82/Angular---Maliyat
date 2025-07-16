import { Injectable } from '@angular/core';
@Injectable()
export class FileDownloder {
    public static SaveAs(content, fileName: string, encoder: string, mimType: string) {
        const a = document.createElement('a');
        document.body.appendChild(a);

        const blob = new Blob([encoder, content], { type: mimType });
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
