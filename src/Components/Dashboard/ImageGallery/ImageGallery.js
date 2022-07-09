import React from 'react';
import {MDBRow} from "mdb-react-ui-kit";
import ImageContainer from "./Image/ImageContainer";

export default function ImageGallery({imageList, filter, handleDeleteImage, handleEditButton}) {

    const list = imageList
        .filter(image => filter(image.name))
        .map(
            image =>
                <ImageContainer handleEditButton={handleEditButton} handleDeleteButton={handleDeleteImage}
                                imageObject={image} key={image.uuid}/>);

    return (
        <MDBRow>
            {list}
        </MDBRow>
    );
}
