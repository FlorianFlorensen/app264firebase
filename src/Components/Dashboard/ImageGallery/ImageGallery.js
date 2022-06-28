import React from 'react';
import {MDBRow} from "mdb-react-ui-kit";
import ImageContainer from "./Image/ImageContainer";

export default function ImageGallery({imageList, handleDeleteImage, handleEditButton}) {

    const list = imageList.map(
        image =>
            <ImageContainer handleEditButton={handleEditButton} handleDeleteButton={handleDeleteImage}
                            imageObject={image} key={image.uuid}/>);

    return (
        <MDBRow>
            {list}
        </MDBRow>
    );
}