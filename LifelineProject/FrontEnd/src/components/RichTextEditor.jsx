import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange }) => {
  const handleChange = (content, delta, source, editor) => {
    onChange(content);
  };

  return (
    <ReactQuill
      value={value}
      onChange={handleChange}
      modules={RichTextEditor.modules}
      formats={RichTextEditor.formats}
      placeholder="Body"
    />
  );
};

RichTextEditor.modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],                                     
  ],
  clipboard: {
    matchVisual: false,
  }
};

RichTextEditor.formats = [
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
];

export default RichTextEditor;
