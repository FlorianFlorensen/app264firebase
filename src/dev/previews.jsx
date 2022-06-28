import React from 'react';
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox';
import {PaletteTree} from './palette';
import ImageContainer
  from "../Components/Dashboard/ImageGallery/Image/ImageContainer";

const ComponentPreviews = () => {
  return (
      <Previews palette={<PaletteTree/>}>
        <ComponentPreview path="/ImageContainer">
          <ImageContainer/>
        </ComponentPreview>
      </Previews>
  );
};

export default ComponentPreviews;