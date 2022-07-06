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
import axios from "axios";
import ImageGallery from "./ImageGallery/ImageGallery";
import "./Dashboard.css"
import "./ImageGallery/Image/ImageContainer.css";
import {firebase_storage} from "../../firebase";
import {database} from "../../firebase";
import {collection, getDocs, query, where} from "@firebase/firestore";
import CropperModal from "./CropperModal/CropperModal";
import {addFileToStore} from "../../firebase/database/databaseService";
import {getFunctions, httpsCallable} from "firebase/functions";

function Dashboard() {
    const [imagesList, setImagesList] = useState([]);
    const [galleryFilterList, setGalleryFilterList] = useState([])
    //all Images from Database / Storage
    const [allImages, setAllImages] = useState([])
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    //all Files States for uploading
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [percent, setPercent] = useState();
    const [uploading, setUploading] = useState(false);
    //Tab Navigation
    const [activeTab, setActiveTab] = useState('tab1');
    //Image that is shown inside Cropper
    const [image, setImage] = useState();
    const [centredModal, setCentredModal] = useState(false);

    useEffect(() => {
        retreiveImages();
    }, [])

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
        let tmp = imagesList.filter(img => img.storage_url === event.target.id).at(0);
        let selectedImage = {
            ...tmp,
        }
        console.log("selected image", image);
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
        let progressFraction = Math.round(100 / filesToUpload.length);
        let totalProgress = 0;

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload.item(i);
            const storageRef = ref(firebase_storage, `/files/${file.name}`)
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    setUploading(true);
                    //const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    // update progress
                    //setPercent(percent);
                },
                (err) => console.log(err),
                () => {
                    totalProgress = totalProgress + progressFraction;
                    //console.log(totalProgress)
                    console.log(i)
                    let percent = i === filesToUpload.length - 1 ? 100 : totalProgress;
                    setPercent(percent)
                    // download url
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        addFileToStore(file, url, false)
                    });
                }
            );
        }
    }

    function handleDeleteButton(event) {
        console.log(event)
        let id = event.target.value
        event.preventDefault();
        console.log("Delete this image " + id);
        axios.delete(`/api/image/${id}`)
            .then(() => {
                //in case a previous delete attempt threw error we reset the error banner here
                setError(false);
                //remove the deleted image from state to get refresh
                setImagesList(prevState => prevState.filter(
                    image => !(image.uuid === event.target.id)));

            }).catch(err => {
            console.log(err);
            setError(true);
            setErrorMessage(
                "Something unexpected happen when trying to delete Image");
        })
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
        const allImages = collection(database, "files");
        //TODO : There is no way there is not a way to get all dcuments
        const q = query(allImages);
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
