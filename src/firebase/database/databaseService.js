import {addDoc, collection} from "@firebase/firestore";
import {database} from "../index";

/**
 * adds a File to the "files" collection in firestore Database
 * @param filename the name of the file
 * @param download_url the Download Url retrieved from firebase Storage
 */
function addFileToStore(filename, download_url) {
    const collectionRef = collection(database, "files");
    addDoc(collectionRef, {
        name: filename,
        storage_url: download_url,
        is_widget_ready: false,
    })
        .then(res => console.log(res))
        .catch(err => console.log(err));
}

export {
    addFileToStore,
}