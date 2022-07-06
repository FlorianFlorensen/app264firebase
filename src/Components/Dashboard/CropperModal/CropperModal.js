import React, {useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog, MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle
} from "mdb-react-ui-kit";
import Cropper from "react-cropper";
import "./cropper.css"
import CroppedImagePreviewModal from "./CroppedImageModal/CroppedImagePreviewModal";
import {getDownloadURL, ref, uploadString} from "firebase/storage";
import {firebase_storage, functions} from "../../../firebase";
import {updateFileDocument} from "../../../firebase/database/databaseService";
import {httpsCallable} from "firebase/functions";

/**
 * The tricky thing with the cropper is that you need to initialize it when the modal element is actually rendered
 * if you do it before it behaves strangely. Because the cropper recieves its dimensions from the parent container
 */
function CropperModal({image, showModal, setShowModal, toggleShow}) {

    const [cropper, setCropper] = useState();
    const cropperRef = useRef();
    const [showResult, setShowResult] = useState(false);
    const [croppedImage, setCroppedImage] = useState(image);

    useEffect(() => {
        if (image != null) {
            //cropper && cropper.zoomTo(0).rotateTo(0)
            setCroppedImage(image);
            return;
        } else {
            setCropper(null);
        }
    }, [image, cropper]);

    if (!showModal) {
        return <></>;
    } else {
        return (
            <>
                <MDBModal tabIndex='-1' show={showModal} setShow={setShowModal} onHide={handleClose}>
                    <MDBModalDialog size="xl" centered>
                        <MDBModalContent>
                            <MDBModalHeader>
                                <MDBModalTitle>Modal title</MDBModalTitle>
                                <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <Cropper
                                    ref={cropperRef}
                                    src={croppedImage.storage_url}
                                    style={{height: 500, width: '100%'}}
                                    initialAspectRatio={1}
                                    viewMode={1}
                                    dragMode="move"
                                    cropBoxResizable={false}
                                    cropBoxMovable={true}
                                    center={true}
                                    toggleDragModeOnDblclick={false}
                                    checkOrientation={true}
                                    onInitialized={instance => setCropper(instance)}
                                    minCropBoxWidth={200}
                                    minCropBoxHeight={200}
                                />
                            </MDBModalBody>
                            <MDBModalFooter>
                                <MDBBtn color='secondary' onClick={toggleShow}>
                                    Close
                                </MDBBtn>
                                <MDBBtn onClick={onCrop}>Crop</MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
                {showResult &&
                    <CroppedImagePreviewModal show={showResult} setShow={setShowResult} croppedImage={croppedImage}
                                              uploadCroppedImage={uploadCroppedImage}/>
                }
            </>
        );
    }

    /**
     * Modal
     */
    function handleClose() {
        setCropper(false);
    }

    function onCrop() {
        const imageElement = cropperRef.current;
        const cropper = imageElement.cropper;

        const cropp_data = cropper.getData(true);
        const crop_preview = httpsCallable(functions, 'crop_preview');
        crop_preview({
            filename: image.name,
            cropp_data,
        })
            .then((result) => {
                console.log(result);
                setCroppedImage({
                    ...croppedImage,
                    image_base64: result.data.proccessed_image_base64,
                })
                setShowResult(true)
            });
    }

    //TODO : dont write new one, update existing document instead
    //TODO: anderer Name oder arbeischritte aufteilen
    async function uploadCroppedImage() {
        const storageRef = ref(firebase_storage, `/files/${croppedImage.name}`)
        uploadString(storageRef, croppedImage.image_base64, 'base64')
            .then(snapshot => {
                getDownloadURL(snapshot.ref).then(url => {
                    updateFileDocument(croppedImage, url, true);
                })
            })
        setShowModal(false);
        setShowResult(false);
    }
}

export default CropperModal;
