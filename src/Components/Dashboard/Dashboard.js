import React, {useEffect, useState} from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBProgress,
    MDBProgressBar,
    MDBTabs,
    MDBTabsContent,
    MDBTabsItem,
    MDBTabsLink, MDBTabsPane
} from "mdb-react-ui-kit";
import {ref, uploadBytesResumable, getDownloadURL} from "firebase/storage"
import ImageGallery from "./ImageGallery/ImageGallery";
import "./Dashboard.css"
import "./ImageGallery/Image/ImageContainer.css";
import {firebase_storage} from "../../firebase";
import {database} from "../../firebase";
import {collection, getDocs, query} from "@firebase/firestore";
import CropperModal from "./CropperModal/CropperModal";
import {addFileToStore, deleteFileDocument} from "../../firebase/database/databaseService";

function Dashboard() {
    const [imagesList, setImagesList] = useState([]);
    const [galleryFilterList, setGalleryFilterList] = useState([])
    //all Images from Database / Storage
    const [allImages, setAllImages] = useState([])
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    //all Files States for uploading
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [percent, setPercent] = useState(0);
    const [uploading, setUploading] = useState(false);
    //Tab Navigation
    const [activeTab, setActiveTab] = useState('tab1');
    //Image that is shown inside Cropper
    const [image, setImage] = useState();
    const [centredModal, setCentredModal] = useState(false);

    //TODO: This is stupid, i need a way to refresh my imagelist on edit, delete, add.
    useEffect(() => {
        retreiveImages();
    }, [activeTab])

    return (
        <div id="dashboard">
            <section className="section">
                <MDBContainer className="h-100">
                    <MDBInput label='Search' id='form1' type='text' onChange={imageGalleryFilter}/>
                    <input type="file" accept="image/*" multiple onChange={handleUploadChange}/>
                    <button onClick={handleUpload}>Upload to Firebase</button>
                    {uploading &&
                        <MDBProgress height='20'>
                            <MDBProgressBar width={percent} valuemin={0} valuemax={100}>
                                {percent}%
                            </MDBProgressBar>
                        </MDBProgress>
                    }
                    <MDBTabs justify>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleTabClick('tab1')} active={activeTab === 'tab1'}>
                                Needs Croping</MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleTabClick('tab2')} active={activeTab === 'tab2'}>Ready for
                                Widget</MDBTabsLink>
                        </MDBTabsItem>
                    </MDBTabs>
                    <MDBTabsContent>
                        <MDBTabsPane show={activeTab === 'tab1'}>
                            <ImageGallery imageList={imagesList.filter((img) => !img.is_widget_ready)}
                                          handleDeleteImage={handleDeleteButton}
                                          handleEditButton={handleEditButton}/>
                        </MDBTabsPane>
                        <MDBTabsPane show={activeTab === 'tab2'}>

                            <ImageGallery imageList={imagesList.filter((img) => img.is_widget_ready)}
                                          handleDeleteImage={handleDeleteButton}
                                          handleEditButton={handleEditButton}/>
                        </MDBTabsPane>
                    </MDBTabsContent>
                </MDBContainer>
            </section>
            <section>
                {image &&
                    <CropperModal showModal={centredModal} setShowModal={setCentredModal} toggleShow={toggleShow}
                                  image={image}></CropperModal>
                }
            </section>
        </div>
    );

    function handleEditButton(event) {
        let selectedImage = imagesList.filter(img => img.storage_url === event.target.id).at(0);
        console.log("selected image", selectedImage);
        setImage(selectedImage)
        setCentredModal(true);
    }

    function toggleShow() {
        setCentredModal(!centredModal);
    }

    function handleTabClick(value) {
        if (value === activeTab) {
            return;
        }
        setActiveTab(value);
    }

    function handleUploadChange(event) {
        console.log(event.target.files);
        setFilesToUpload(event.target.files);
    }

    //TODO: fix the upload bar
    function handleUpload() {
        if (!filesToUpload) {
            return;
        }
        //for Progress Bar
        setPercent(0); //Reset Progress Bar
        let progressFraction = Math.floor(100 / filesToUpload.length);
        let filesLeft = filesToUpload.length - 1;
        let totalProgress = 0;

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload.item(i);
            const storageRef = ref(firebase_storage, `/files/${file.name}`)
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    setUploading(true);
                },
                (err) => console.log(err),
                () => {
                    console.log(filesLeft )
                    totalProgress += progressFraction
                    setPercent(filesLeft > 0 ? totalProgress : 100)
                    filesLeft--;
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        addFileToStore(file, url, false)
                    });
                }
            );
        }
    }

    function handleDeleteButton(event) {
        let id = event.target.value
        event.preventDefault();
        const imageToBeDeleted = imagesList.find(img => img.uuid === id);
        deleteFileDocument(imageToBeDeleted);
    }

    function imageGalleryFilter(event) {
        (async () => {
            let filterResult = allImages
                .filter((image) => {
                    return image.original_filename.toUpperCase().includes(
                            event.target.value.toUpperCase().trim())
                        && event.target.value !== "";
                });
            console.log(filterResult)
            setGalleryFilterList(filterResult);
        })();
    }

    function retreiveImages() {
        const collectionRef = collection(database, "files");
        //TODO : There is no way there is not a way to get all dcuments
        const q = query(collectionRef);
        getDocs(q)
            .then(snapshot => {
                let temp = [];
                snapshot.forEach((doc) => {
                    temp.push({
                        uuid: doc.id,
                        ...doc.data()
                    });
                })
                console.log(temp);
                setImagesList(temp);
            })
            .catch(error => console.log(error));
    }
}

export default Dashboard;
