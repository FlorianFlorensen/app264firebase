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

function CroppedImageModal({croppedImage, show, setShow}) {

    useEffect(() => {
        console.log("inside the preview")
        console.log(croppedImage)
    }, [croppedImage])

    const toggleShow = () => setShow(!show);

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
                            <img src={croppedImage.blob_url} alt="Cropped preview" style={{width : 'auto', height : 'auto'}}/>
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={toggleShow}>
                                Close
                            </MDBBtn>
                            <MDBBtn>Save changes</MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );
}

export default CroppedImageModal;