import React, { Component } from 'react';
import "./ImageUploader.css"

class ImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: null,
      previewImage: null,
    };
  }

  handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.props.imageUploadHandler(this.props.index,"base64_image", reader.result)
      };

      reader.readAsDataURL(file);
    }
  };


  handleDeleteImage = () => {
    this.props.imageUploadHandler(this.props.index,"base64_image", null);
    document.getElementById(this.props.htmlFor).value = '';
    // You can also add logic to delete the image on the server if needed.
  };

  render() {
    return (
      <div className="image-uploader-container" >
         {/* <label htmlFor='imageInput' >upload image</label> */}
        <input
          type="file"
          accept="image/*"
          onChange={this.handleImageChange}
          id = {this.props.htmlFor}
          className="image-uploader-input"
        />
        {this.props.data.base64_image && (
          <div className='image-container' >
            <img
              className='image-uploader-image'
              src={this.props.data.base64_image}
              alt="Preview"
              // style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
            {/* <button onClick={this.handleReloadImage}>Reload</button> */}
            <span className='image-uploader-delete-button' onClick={this.handleDeleteImage}>X</span>
          </div>
        )}
      </div>
    );
  }
}

export default ImageUploader;
