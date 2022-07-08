import React, {useEffect} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog, MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle
} from "mdb-react-ui-kit";

function CroppedImagePreviewModal({croppedImage, show, setShow, uploadCroppedImage, base64CroppedImage}) {

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
                            <MDBModalTitle>Preview</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <img src={`data:image/jpeg;base64,${base64CroppedImage}`} alt="Cropped preview" style={{width : 'auto', height : 'auto'}}/>
                        </MDBModalBody>
                        <MDBModalFooter>
                            <MDBBtn color='secondary' onClick={toggleShow}>
                                Close
                            </MDBBtn>
                            <MDBBtn onClick={onSaveHandler}>Save changes</MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );

    function onSaveHandler(){
        uploadCroppedImage(base64CroppedImage);
    }
}

export default CroppedImagePreviewModal;
