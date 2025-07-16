import { Injectable } from "@angular/core";

@Injectable()
export class FileExtensionService {
  private static imageMimeTypes = ["image/jpg", "image/jprg", "image/png"];
  private static imageExtensions = ["jpeg", "jpg", "jprg", "png"];

  public static IsValidImageFormatByExtension(fileExtension: string): boolean {
    return this.imageMimeTypes.indexOf(fileExtension) > -1;
  }
  public static IsValidImageFormatByFileName(fileName: string): boolean {
    var fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
    return this.imageExtensions.indexOf(fileExtension.toLocaleLowerCase()) > -1;
  }
}
