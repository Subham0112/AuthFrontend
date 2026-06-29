import React, { useState, useRef, useEffect, useContext } from 'react';
import { UserDataContext } from '../context/userContext';
import type { PostData } from '../pages/UserDashboard';
// import Alert from './Alert';
import axios from 'axios';
import type { AlertData } from './Alert';

interface Props {
  post: PostData;
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
  onClose: () => void;
}

const EditModal = ({ post, setAlert, onClose, setPosts }: Props) => {
  const [content, setContent] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const context = useContext(UserDataContext);

  useEffect(() => {
    setContent(post.content);
    setVisibility(post.visiblity);
  }, [post]);

  if (!context) return null;
  const { user } = context;

  const handleUpdatePost = async () => {
    try {
        const updateData={
            post_id:post.id,
            user_id:user.id,
            content,
            visibility,
        }
        console.log(updateData)
        const updatePost=await axios.patch(`${import.meta.env.VITE_BACKEND_API}/update-post`,updateData,{
            withCredentials:true
        })
        if(updatePost.status===200){
       setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, content, visiblity: visibility } : p))
      );
           setAlert({
        type: 'success',
        title: 'Post Updated',
        message: updatePost.data.message,
      });
      onClose();
        }
     
    } catch (err) {
        if(axios.isAxiosError(err)){
            const data = err.response?.data
            if(data?.message){
        setAlert({
          type:"error",
          title:"Error Updating Posts",
          message:data.message
        })
        console.error("Error Updating Post:",data.message)
            }
        }else{
        setAlert({
        type:"error",
        title:"Error Updating Posts",
        message:"Error Updating Posts"
    })
        }
     
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
      <div className='w-[80%] sm:w-[70%]  max-h-[80%] overflow-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-slate-900'>Edit Post</h2>
            <p className='text-sm text-slate-500'>Edit content and visibility. Media is shown but not editable.</p>
          </div>
          <button
            type='button'
            className='rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700'
            aria-label='Close modal'
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className='space-y-4'>
          <div className='rounded-3xl p-4'>
            <label htmlFor='postText' className='sr-only'>Post text</label>
            <textarea
              onChange={(e) => {
                setContent(e.target.value);
              }}
              value={content}
              name='content'
              id='postText'
              className='min-h-[160px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
              placeholder='What do you want to share today?'
            />
          </div>

          <div className='rounded-3xl border border-slate-200 bg-white p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-800'>Media</p>
                <p className='text-xs text-slate-500'>Existing media (display only).</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-xs text-slate-500'>Media cannot be changed here</div>
              </div>
              <input ref={fileRef} id='file' className='p-2' type='file' hidden />
            </div>

            <div className='mt-3 flex gap-2 flex-wrap'>
              {post.media && post.media.map((m) => (
                <img key={m.media_id} src={m.file_url} alt='post media' className='h-28 w-28 object-cover rounded-md' />
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className=''>
              <select name='visiblity' value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value='all'>All</option>
                <option value='onlyme'>Only me</option>
              </select>
            </div>
            <div className='flex flex-wrap gap-2'>

              <button
                onClick={handleUpdatePost}
                type='button'
                className='rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800'
              >
                Update
              </button>
              <button
                type='button'
                className='rounded-2xl bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300'
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
