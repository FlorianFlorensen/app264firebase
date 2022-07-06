import React, {useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog, MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle
} from "mdb-react-ui-kit";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {firebase_storage} from "../../../../firebase";
import {addFileToStore, addImageToStore} from "../../../../firebase/database/databaseService";

function CroppedImagePreviewModal({croppedImage, show, setShow, uploadCroppedImage}) {

    const toggleShow = () => setShow(!show);

    useEffect(() => {
        console.log("this is the image in the prview", croppedImage);
    }, [croppedImage])

    return (
        <>
            <MDBBtn onClick={toggleShow}>Vertically centered modal</MDBBtn>

            <MDBModal tabIndex='-1' show={show} setShow={setShow}>
                <MDBModalDialog centered>
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Modal title</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <img src={`data:image/jpeg;base64,${croppedImage.image_base64}`} alt="Cropped preview" style={{width : 'auto', height : 'auto'}}/>
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={toggleShow}>
                                Close
                            </MDBBtn>
                            <MDBBtn onClick={uploadCroppedImage}>Save changes</MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );
}

export default CroppedImagePreviewModal;
