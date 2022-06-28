import React from 'react';
import {MDBBtn, MDBCol, MDBIcon} from "mdb-react-ui-kit";

/**
 * @param imageObject needs to contain at Lest "original_file_url", "original_filename", "uuid"
 * @param handleDeleteImage Button handler for the delete Button, needs the id of the image or some oder kind of identifier
 * @returns {JSX.Element}
 */
export default function ImageContainer({imageObject, handleDeleteButton, handleEditButton}) {

    let image = imageObject;
    return (
        <MDBCol lg='2' className="py-2 px-1 m-3">
            <div className='bg-image hover-overlay' style={{maxWidth: '24rem'}}>
                <img src={image.storage_url} className='img-fluid rounded-7' alt="notting in alt tag"/>
                {!image.is_widget_ready &&
                    <a href='#!' id={image.storage_url} onClick={handleEditButton}>
                        <div id={image.storage_url} className='mask overlay rounded-7'
                             style={{backgroundColor: 'rgba(49,116,249,0.5)'}}>
                            <MDBIcon id={image.storage_url}
                                     className="d-flex justify-content-center align-items-center h-100" size="2x"
                                     color="light" icon="crop"/>
                        </div>
                    </a>
                }
            </div>
            <MDBBtn className="mt-2" color="danger" value={image.uuid} onClick={handleDeleteButton}>Delete</MDBBtn>
            <div>
                <p className="mt-2">{image.name}</p>
            </div>
        </MDBCol>
    );
}