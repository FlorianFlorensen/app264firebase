import {addDoc, collection} from "@firebase/firestore";
import {database} from "../index";

/**
 * adds a File to the "files" collection in firestore Database
 * @param file / browser file like new File()
 * @param download_url the Download Url retrieved from firebase Storage
 */
function addFileToStore(file, download_url) {
    const collectionRef = collection(database, "files");
    addDoc(collectionRef, {
        name: file.name,
        storage_url: download_url,
        is_widget_ready: false,
        mime_type : file.type,
        file_created : file.lastModified
    })
        .then(res => console.log(res))
        .catch(err => console.log(err));
}

export {
    addFileToStore,
}