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
import CroppedImageModal from "./CroppedImageModal/CroppedImageModal";

/**
 * The tricky thing with the cropper is that you need to initialize when the modal element is actually rendered
 * if you do it before it behaves strangely
 */
function CropperModal({image, showModal, setShowModal, toggleShow}) {

    const [cropper, setCropper] = useState();
    const cropperRef = useRef();
    const [showResult, setShowResult] = useState(false);
    const [croppedImage, setCroppedImage] = useState(image);

    useEffect(() => {
        if (image != null) {
            //cropper && cropper.zoomTo(0).rotateTo(0)
            console.log("the image ")
            console.log(image)
            return;
        } else {
            setCropper(null);
        }
    }, [image, cropper]);

    /**
     * Modal
     */
    function handleClose() {
        setCropper(false);
    }

    /**gs://test-848b6.appspot.com
     * Cropper
     */


    function onCrop() {
        const imageElement = cropperRef.current;
        const cropper = imageElement.cropper;
        const canvasData = cropper.getCroppedCanvas({
            minWidth: 200,
            maxWidth: 200,
            imageSmoothingQuality: "high",
            imageSmoothingEnabled: true,
        });
        canvasData.toBlob((blob) => {
            setCroppedImage({
                ...croppedImage,
                blob_url : URL.createObjectURL(blob),
            });
        });
        setShowResult(true);
    }

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
            <CroppedImageModal show={showResult} setShow={setShowResult} croppedImage={croppedImage}/>
        </>
    );
}

export default CropperModal;