import { storage } from "../firebaseconfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {File} file - The file to upload.
 * @param {string} path - The path where the file will be stored.
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */

export const uploadFile = async (file, path) => {
    try {
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);
            return fileURL;
    } catch (error) {
      console.error("Error uploading file: ", error);
      throw new Error("Failed to upload file.");
    }
  };


  export const renderFilePreview = (url) => {
    console.log("Rendering file preview for URL:", url);
    const fileExtension = url.split(".").pop().split("?")[0].toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif"];
    const pdfExtension = "pdf";

    if (imageExtensions.includes(fileExtension)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt="Image Preview" className="file-preview" />
        </a>
      );
    } else if (fileExtension === pdfExtension) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <embed type="application/pdf" src={url} width="100%" height="300px" />
        </a>
      );
    } else {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="file-link"
        >
          View file
        </a>
      );
    }
  };
