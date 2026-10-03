import { useEffect, useState } from "react";

// Backend URL comes from .env (VITE_API_URL)
const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/posts`;

const emptyForm = { title: "", content: "", author: "" };

const App = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // READ: load posts when the page opens
  const fetchPosts = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setPosts(data);
      setError("");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const url = editId ? `${API}/${editId}` : API;
    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, author: form.author.trim() || "Anonymous" }),
      });
      setForm(emptyForm);
      setEditId(null);
      fetchPosts();
    } catch {
      setError("Could not save the post.");
    }
  };

  const startEdit = (post) => {
    setEditId(post._id);
    setForm({ title: post.title, content: post.content, author: post.author });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  // DELETE
  const deletePost = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setPosts(posts.filter((p) => p._id !== id));
    } catch {
      setError("Could not delete the post.");
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>MERN Blog</h1>
      </header>

      <form className="post-form" onSubmit={handleSubmit}>
        <h2>{editId ? "Edit Post" : "Write a New Post"}</h2>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input name="author" placeholder="Your name (optional)" value={form.author} onChange={handleChange} />
        <textarea name="content" rows="5" placeholder="Write your post..." value={form.content} onChange={handleChange} />
        <div className="post-form__buttons">
          <button type="submit">{editId ? "Update Post" : "Publish"}</button>
          {editId && (
            <button type="button" className="btn--grey" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="app__error">{error}</p>}

      <section className="posts">
        {loading ? (
          <p className="app__msg">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="app__msg">No posts yet. Write the first one!</p>
        ) : (
          posts.map((post) => (
            <article className="post" key={post._id}>
              <h3 className="post__title">{post.title}</h3>
              <p className="post__meta">
                By {post.author} · {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="post__content">{post.content}</p>
              <div className="post__actions">
                <button onClick={() => startEdit(post)}>Edit</button>
                <button className="btn--red" onClick={() => deletePost(post._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default App;
