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
import {functions} from "../../../firebase";
import {httpsCallable} from "firebase/functions";

/**
 * The tricky thing with the cropper is that you need to initialize it when the modal element is actually rendered
 * if you do it before it behaves strangely. Because the cropper recieves its dimensions from the parent container
 */
function CropperModal({image, showModal, setShowModal, toggleShow, uploadCroppedImage}) {

    const [cropper, setCropper] = useState();
    const cropperRef = useRef();
    const [showPreview, setShowPreview] = useState(false);
    //to show that the image is currently being worked on in the backend
    const [proccessing, setProccessing] = useState(false);
    const [base64_cropped_preview, setBase64_cropped_preview] = useState("")

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
                                <MDBModalTitle>Edit</MDBModalTitle>
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
                {showPreview ?
                    <CroppedImagePreviewModal
                        show={showPreview}
                        setShow={setShowPreview}
                        base64CroppedImage={base64_cropped_preview}
                        handleOnSave={handleOnSave}/>
                    : null
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
        const result = await cropImage();
        console.log(result);
        setBase64_cropped_preview(result);
        setProccessing(false);
        setShowPreview(true)
    }

    async function handleOnCrop() {
        setProccessing(true);
        const result_string = await cropImage();
        setProccessing(false);
        uploadCroppedImage(result_string, image);
    }

    async function cropImage() {
        const cropp_data = cropperRef.current.cropper.getData(true);
        const crop_preview = httpsCallable(functions, 'crop_preview');
        const result = await crop_preview({
            filename: image.name,
            cropp_data,
        });
        return result.data.proccessed_image_base64;
    }

    function handleOnSave() {
        uploadCroppedImage(base64_cropped_preview, image);
        setShowModal(false);
    }
}

export default CropperModal;
