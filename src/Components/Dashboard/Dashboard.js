import React, {useEffect, useRef, useState} from 'react';
import {
    MDBContainer,
    MDBInput,
    MDBProgress,
    MDBProgressBar,
    MDBTabs,
    MDBTabsContent,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane,
    MDBToast,
} from 'mdb-react-ui-kit';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import ImageGallery from './ImageGallery/ImageGallery';
import './Dashboard.css';
import './ImageGallery/Image/ImageContainer.css';
import {firebase_storage} from '../../firebase';
import {database} from '../../firebase';
import {collection, getDocs, query} from '@firebase/firestore';
import CropperModal from './CropperModal/CropperModal';
import {
    addFileToStore,
    deleteFileDocument,
} from '../../firebase/database/databaseService';

function Dashboard() {
    const [imagesList, setImagesList] = useState([]);
    //Search bar filter
    const [filter, setFilter] = useState(() => (name) => true);
    //all Files States for uploading
    const [filesToUpload, setFilesToUpload] = useState([]);
    //Upload progress bar percent
    const [percent, setPercent] = useState(0);
    const [uploading, setUploading] = useState(false);
    //Tab Navigation
    const [activeTab, setActiveTab] = useState('tab1');
    //Image that is shown inside Cropper
    const [image, setImage] = useState();
    const [centredModal, setCentredModal] = useState(false);
    const triggerToastSavedRef = useRef(null);


    //TODO: This is stupid, i need a way to refresh my imagelist on edit, delete, add.
    useEffect(() => {
        retrieveImages();
    }, [activeTab]);

    return (
        <div id="dashboard">
            <section className="section">
                <MDBContainer className="h-100">
                    <MDBInput
                        className="mt-4"
                        label="Search"
                        id="form1"
                        type="text"
                        onChange={handleSearchInput}
                    />
                    <div className="mt-4">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUploadChange}
                        />
                        <button onClick={handleFileUpload}>Upload to Firebase</button>
                        {uploading && (
                            <MDBProgress className="mt-2" height="20">
                                <MDBProgressBar width={percent} valuemin={0} valuemax={100}>
                                    {percent} %
                                </MDBProgressBar>
                            </MDBProgress>
                        )}
                    </div>
                    <MDBTabs justify className="mt-3 mb-3">
                        <MDBTabsItem>
                            <MDBTabsLink
                                onClick={() => handleTabClick('tab1')}
                                active={activeTab === 'tab1'}
                            >
                                Needs Croping
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink
                                onClick={() => handleTabClick('tab2')}
                                active={activeTab === 'tab2'}
                            >
                                Ready for Widget
                            </MDBTabsLink>
                        </MDBTabsItem>
                    </MDBTabs>
                    <MDBTabsContent>
                        <MDBTabsPane show={activeTab === 'tab1'}>
                            <ImageGallery
                                filter={filter}
                                imageList={imagesList.filter((img) => !img.is_widget_ready)}
                                handleDeleteImage={handleDeleteButton}
                                handleEditButton={handleEditButton}
                            />
                        </MDBTabsPane>
                        <MDBTabsPane show={activeTab === 'tab2'}>
                            <ImageGallery
                                filter={filter}
                                imageList={imagesList.filter((img) => img.is_widget_ready)}
                                handleDeleteImage={handleDeleteButton}
                                handleEditButton={handleEditButton}
                            />
                        </MDBTabsPane>
                    </MDBTabsContent>
                </MDBContainer>
            </section>
            <section>
                {image !== null ? (
                    <CropperModal
                        showModal={centredModal}
                        setShowModal={setCentredModal}
                        toggleShow={toggleModalShow}
                        image={image}
                        setImage={setImage}
                        triggerToastSaved={triggerToastSaved}
                    ></CropperModal>
                ) : null}
            </section>
            <section>
                <input hidden={true} ref={triggerToastSavedRef}/>
                <MDBToast
                    color="success"
                    autohide
                    position="top-right"
                    delay={2000}
                    appendToBody
                    triggerRef={triggerToastSavedRef}
                    headerContent={
                        <>
                            <strong className="me-auto">Success</strong>
                        </>
                    }
                    bodyContent="Image was saved successfully"
                />
            </section>
        </div>
    );

    function triggerToastSaved() {
        triggerToastSavedRef.current.click();
    }

    function handleEditButton(event) {
        let selectedImage = imagesList
            .filter((img) => img.storage_url === event.target.id)
            .at(0);
        setImage(selectedImage);
        setCentredModal(true);
    }

    function toggleModalShow() {
        setCentredModal(!centredModal);
    }

    function handleTabClick(value) {
        if (value === activeTab) {
            return;
        }
        setActiveTab(value);
    }

    function handleFileUploadChange(event) {
        setFilesToUpload(event.target.files);
    }

    //TODO: fix the upload bar
    function handleFileUpload() {
        setUploading(true);
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
            const storageRef = ref(firebase_storage, `/files/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                },
                (err) => console.log(err),
                // eslint-disable-next-line no-loop-func
                () => {
                    totalProgress += progressFraction;
                    setPercent(filesLeft > 0 ? totalProgress : 100);
                    filesLeft--;
                    getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        addFileToStore(file, url, false);
                    });
                }
            );
            //TODO: thas is a stupid way to do that
            if (filesLeft <= 1) {
                setUploading(false);
            }
        }

    }

    function handleDeleteButton(event) {
        let id = event.target.value;
        event.preventDefault();
        const imageToBeDeleted = imagesList.find((img) => img.uuid === id);
        deleteFileDocument(imageToBeDeleted);
        setImagesList(imagesList.filter((img) => img.uuid !== id));
    }

    function handleSearchInput(event) {
        const value = event.target.value;
        const filterFunction = (name) => {
            return name.toUpperCase()
                .includes(value.toUpperCase().trim());
        }
        setFilter(() => filterFunction);
    }

    function retrieveImages() {
        const collectionRef = collection(database, 'files');
        //TODO : There is no way there is not a way to get all documents
        const q = query(collectionRef);
        getDocs(q)
            .then((snapshot) => {
                let temp = [];
                snapshot.forEach((doc) => {
                    temp.push({
                        uuid: doc.id,
                        ...doc.data(),
                    });
                });
                console.log(temp);
                setImagesList(temp);
            })
            .catch((error) => console.log(error));
    }
}

export default Dashboard;
