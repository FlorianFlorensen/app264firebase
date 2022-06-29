import {addDoc, collection, doc, updateDoc, where} from "@firebase/firestore";
import {database} from "../index";

/**
 * adds a File to the "files" collection in firestore Database
 * @param file / browser file like new File()
 * @param download_url the Download Url retrieved from firebase Storage
 */
function addFileToStore(file, download_url, is_widget_ready) {
    const collectionRef = collection(database, "files");
    addDoc(collectionRef, {
        name: file.name,
        storage_url: download_url,
        is_widget_ready: is_widget_ready,
        mime_type : file.type,
        file_created : file.lastModified
    })
        .then(res => console.log(res))
        .catch(err => console.log(err));
}

/**
 * updates the current document in the store instead of creating a new one, used to store the info of the croppedImage
 * @param file
 * @param download_url
 * @param is_widget_ready
 */
//TODO: these should not be two functions
function addImageToStore(file, download_url, is_widget_ready) {
    const docRef = doc(database, "files", file.uuid)
    console.log(file)
    updateDoc(docRef, {
        name: file.name,
        storage_url: download_url,
        is_widget_ready: is_widget_ready,
        mime_type : file.mime_type,
        file_created : file.file_created
    })
        .then(res => console.log(res))
        .catch(err => console.log(err));
}

export {
    addFileToStore,
    addImageToStore
}