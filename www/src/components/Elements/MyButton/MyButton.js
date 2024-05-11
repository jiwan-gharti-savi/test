import React from 'react';
import './MyButton.scss'
import { Button } from 'reactstrap';

const MyButton = (props) => {
  return (
    <Button 
      disabled ={props.disabled}
      onClick={props.onClick} 
      className={props.className + (props.leftHoverImage ? " ia_button_left" : props.rightHoverImage ? " ia_button_right" : "") + " my-button-transition"} 
      style={props.customStyle}
      id = {props?.id}
    >
      {
        props.leftImage &&
        <img className={props.leftImageClass +" ia_button_left_image"} src={props.leftImage} />
      }
      {props.leftHoverImage &&
      <img className={props.leftImageClass +" ia_button_left_hover_image"} src={props.leftHoverImage} />
      }
      {props.text}
      {props.children}
      {
        props.rightImage &&
        <img className={props.rightImageClass  +" ia_button_right_image"} src={props.rightImage} />
      }
      {props.rightHoverImage &&
      <img className={props.rightImageClass +" ia_button_right_hover_image"} src={props.rightHoverImage} />
      }
      
    </Button>
  );

};

export default MyButton;
