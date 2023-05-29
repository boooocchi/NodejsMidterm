import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CiPaperplane, CiTrash } from "react-icons/ci";

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articleData, setArticleData] = useState();
  const [isPortrait, setIsPortrait] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const commentRef = useRef();
  const commenterRef = useRef();
  const [commentData, setCommentData] = useState({
    commenter: null,
    comment: null
  });
  const [comments, setComments] = useState([]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const updatedCommentData = {
      ...commentData,
      blog_id: id
    };

    setCommentModal(false);

    setTimeout(() => {
      fetch("/api/comment/create", {
        method: "POST",
        body: JSON.stringify(updatedCommentData),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then((response) => {
          if (response.ok) {
            // Handle the successful response
            console.log("Comment created successfully");
            // Redirect or perform any other actions
          } else {
            // Handle the error response
            console.error("Failed to create comment");
          }
        })
        .catch((error) => {
          // Handle any network errors or exceptions
          console.error("Network error:", error);
        });
    }, 1000);

    // navigate(`/article/${id}`);
  };

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/comment/${id}`);
      const data = await res.json();
      const { rows } = data;
      setComments(rows);
    };

    const fetchBlog = async () => {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      const { rows } = data;
      const blogData = rows[0];
      setArticleData(blogData);
    };
    if (!articleData) {
      fetchBlog();
    }

    if (!comments.comment) {
      fetchComments();
    }
  }, [comments, articleData]);

  let imagePath;
  if (articleData) {
    imagePath = JSON.parse(articleData.image).filename;
  }
  useEffect(() => {
    const img = new Image();
    img.src = `/api/${imagePath}`;
    img.onload = () => {
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    };
  }, [imagePath]);

  const imageStyles = {
    width: isPortrait ? "50%" : "auto"
  };

  const inputChangeHandler = (fieldName) => {
    if (fieldName === "comment") {
      setCommentData((previous) => ({
        ...previous,
        comment: commentRef.current.value
      }));
    } else {
      setCommentData((previous) => ({
        ...previous,
        commenter: commenterRef.current.value
      }));
    }
  };

  const deleteHandler = async (e, commentId) => {
    e.preventDefault();
    console.log(commentId);
    await fetch(`/api/comment/delete/${commentId}`, {
      method: "DELETE"
    });
    console.log("Success");
  };

  return (
    <section className="min-h-[70vh] w-[60%] max-md:w-[75%] min-w-[300px] mx-auto pt-[7rem] mb-[7rem] max-w-[1000px]">
      <div className="w-full flex justify-center max-w-[1000px]">
        <img
          src={`/api/${imagePath}`}
          alt=""
          className="grayscale"
          style={imageStyles}
        />
      </div>
      <div className="flex mt-3">
        <h1 className="text-[1.3rem] max-md:text-[1rem] max-mobile:text-[1rem] bg-accent px-2">
          {articleData?.title}
        </h1>
        <span className="text-[0.9rem] ml-auto mr-0 max-md:text-[0.8rem]">
          {articleData?.date?.slice(0, 10)}
        </span>
      </div>

      <p className="mt-10 mb-5 text-[1rem]">{articleData?.article}</p>

      <span className="text-[1rem] ml-auto mr-0 max-md:text-[0.8rem]">
        by {articleData?.author}
      </span>
      <div className="w-full flex justify-end">
        <Link
          to={`/edit/${id}`}
          state={articleData}
          className="hover:text-grayblack pb-[0px] border-b border-black mb-0 leading-[1rem] hover:border-transparent relative max-md:text-[0.9rem]"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          Edit
        </Link>
      </div>

      <h1 className="text-[1rem] mt-[7rem] border-b pb-1">Comments</h1>
      {!comments.length && <p className="mt-5 text-[0.9rem]">No comments</p>}
      <div className="mt-5">
        {comments.map((commentRow) => (
          <div key={commentRow.comment_id}>
            <div className="mb-1 mt-7 text-[0.9rem]">
              @ {commentRow.commenter}
            </div>
            <div className="flex items-center justify-between">
              <p className="tracking-wide">{commentRow.comment}</p>
              <form onSubmit={(e) => deleteHandler(e, commentRow.comment_id)}>
                <button
                  className="hover:text-grayblack pb-[0.1px] hover:border-transparent text-[1.1rem] inline-block cursor-pointer text-accent"
                  type="submit"
                >
                  <CiTrash />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        layout
        transition={{ layout: { duration: 0.2 } }}
        onClick={() => {
          setCommentModal(true);
        }}
        className={
          commentModal
            ? "cursor-pointer mt-[5rem] bg-white"
            : "cursor-pointer mt-[5rem] bg-black inline-block"
        }
      >
        {!commentModal && (
          <motion.h2
            layout="position"
            className="inline-block text-white px-2 py-1 text-[0.9rem]"
          >
            Create a comment
          </motion.h2>
        )}

        {commentModal && (
          <motion.form onSubmit={onSubmitHandler} className="flex flex-col">
            <input
              name="commenter"
              type="text"
              placeholder="Commenter"
              ref={commenterRef}
              onBlur={() => inputChangeHandler("commenter")}
              className="border mb-3 px-2 py-1"
            />
            <textarea
              name="comment"
              placeholder="Comment"
              ref={commentRef}
              onBlur={() => inputChangeHandler("comment")}
              className="border px-2 py-1 h-[6rem]"
            ></textarea>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                layout
                className="cursor-pointer ml-2 text-[1rem] text-grayblack"
                onClick={(e) => {
                  e.stopPropagation();
                  setCommentModal(false);
                }}
              >
                × Close
              </button>
              <button className="text-[1.5rem] mr-1">
                <CiPaperplane />
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </section>
  );
};

export default Article;
