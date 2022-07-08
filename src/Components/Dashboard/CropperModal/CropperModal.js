import React, {useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog, MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle, MDBSpinner
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
function CropperModal({image, setImage, showModal, setShowModal, toggleShow, triggerToastSaved}) {

    const [cropper, setCropper] = useState();
    const cropperRef = useRef();
    const [showPreview, setShowPreview] = useState(false);
    //to show that the image is currently being worked on in the backend
    const [proccessing, setProccessing] = useState(false);
    const [base64_cropped_image, setBase64_cropped_image] = useState("")

    useEffect(() => {
        if (image != null) {
            //cropper && cropper.zoomTo(0).rotateTo(0)
        } else {
            setCropper(null);
        }
    }, [image, cropper]);

    if (!showModal) {
        return null;
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
                                    src={image.storage_url}
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
                                {proccessing ?
                                    <MDBBtn disabled>
                                        <MDBSpinner size='sm' role='status' tag='span' className='me-2'/>
                                        Loading...
                                    </MDBBtn>
                                    :
                                    <MDBBtn onClick={handlePreview}>
                                        Preview
                                    </MDBBtn>
                                }
                                {proccessing ?
                                    <MDBBtn disabled>
                                        <MDBSpinner size='sm' role='status' tag='span' className='me-2'/>
                                        Loading...
                                    </MDBBtn>
                                    :
                                    <MDBBtn onClick={handleOnCrop}>
                                        Crop
                                    </MDBBtn>
                                }
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
                {showPreview &&
                    <CroppedImagePreviewModal show={showPreview} setShow={setShowPreview} croppedImage={image} base64CroppedImage={base64_cropped_image}
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

    async function handlePreview() {
        setProccessing(true);
        await cropImage();
        setProccessing(false);
        setShowPreview(true)
    }

    async function handleOnCrop() {
        setProccessing(true);
        await cropImage();
        setProccessing(false);
        uploadCroppedImage();
    }

    async function cropImage() {
        const cropp_data = cropperRef.current.cropper.getData(true);
        const crop_preview = httpsCallable(functions, 'crop_preview');
        const result = await crop_preview({
            filename: image.name,
            cropp_data,
        });
        setBase64_cropped_image(result.data.proccessed_image_base64);
    }

    //TODO : dont write new one, update existing document instead
    //TODO: anderer Name oder arbeischritte aufteilen
    function uploadCroppedImage() {
        const storageRef = ref(firebase_storage, `/files/${image.name}`)
        console.log("hi", image);
        uploadString(storageRef,base64_cropped_image, 'base64')
            .then(snapshot => {
                getDownloadURL(snapshot.ref).then(async url => {
                    await updateFileDocument(image, url, true);
                    triggerToastSaved();
                })
            })
        //TODO: Das hat hier drinnnen eigentlich nichts verloren´
        setImage(null);
        setShowModal(false);
        setShowPreview(false);
    }
}

export default CropperModal;
