import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

/** DANGER : Ce composant renvoie HTML qui doit être purifié avant l'affichage ! */
const RichEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
        />
    );
}

export const RichTextDisplay = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
    className='ql-editor'
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichEditor;