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

    const [blobUrl, setBlobUrl] = useState(croppedImage);
    const toggleShow = () => setShow(!show);

    useEffect(() => {
        if (croppedImage != null) {
            setBlobUrl(croppedImage);
        }
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
                            <img src={blobUrl} alt="Cropped preview" style={{width : 'auto', height : 'auto'}}/>
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