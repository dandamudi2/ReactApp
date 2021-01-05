import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const saveBlob = (blob, filename) => {
  //   var a = document.createElement("a");
  //   document.body.appendChild(a);
  //   a.style.display = "none";
  //   let url = window.URL.createObjectURL(blob);
  //   a.href = url;
  //   a.download = filename;
  //   a.click();
  //   window.URL.revokeObjectURL(url);

  pdf(blob)
    .toBlob()
    .then((result) => {
      window.saveAs(result, filename);
    });
};

export const savePdf = async (document, filename) => {
  saveBlob(document, filename);
};
