import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BooksImg, Logo, resolveAsset } from "@/lib/assets";
import {
  type ApiBook,
  type ApiBorrowLog,
  type ApiUser,
  borrowBook,
  clearToken,
  getBooks,
  getBorrowLogs,
  getCategories,
  getFeaturedBooks,
  getProfile,
  getToken,
  logout,
  returnBook,
  updateProfile,
} from "@/lib/api";

type Tab = "home" | "books" | "logs" | "edit-profile";
type Category = { id: number; name: string; image?: string | null; books_count?: number };

export default function Home() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<ApiBook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [featured, setFeatured] = useState<ApiBook[]>([]);
  const [userLogs, setUserLogs] = useState<ApiBorrowLog[]>([]);
  const [userProfile, setUserProfile] = useState<ApiUser>({
    id: 0,
    name: "Student User",
    email: "student@cpc.edu.ph",
    avatar: "",
  });

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const authed = !!getToken();

  const loadInitial = async () => {
    setLoading(true);
    setError("");
    try {
      const [catRes, featRes, booksRes] = await Promise.all([
        getCategories(),
        getFeaturedBooks(),
        getBooks(),
      ]);
      setCategories(catRes.data || []);
      setFeatured(featRes.data || []);
      setBooks(booksRes.data || []);

      if (authed) {
        try {
          const [profileRes, logsRes] = await Promise.all([getProfile(), getBorrowLogs()]);
          setUserProfile(profileRes.data);
          setUserLogs(logsRes.data || []);
        } catch {
          // token invalid/expired
          clearToken();
          localStorage.removeItem("auth_user");
        }
      } else {
        const cached = localStorage.getItem("auth_user");
        if (cached) {
          try { setUserProfile(JSON.parse(cached)); } catch {}
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await getBooks({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        });
        setBooks(res.data || []);
      } catch {
        // keep previous
      }
    };
    // avoid extra fetch on initial mount when already loaded
    if (!loading) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory]);

  const refreshLogsAndBooks = async () => {
    try {
      const booksRes = await getBooks({ search: searchQuery || undefined, category: selectedCategory || undefined });
      const featRes = await getFeaturedBooks();
      setBooks(booksRes.data || []);
      setFeatured(featRes.data || []);
      if (getToken()) {
        const logsRes = await getBorrowLogs();
        setUserLogs(logsRes.data || []);
      }
    } catch {
      // ignore
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditAvatar(String(reader.result || ""));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken()) {
      alert("Please login to update your profile.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await updateProfile({
        name: editName.trim() || userProfile.name,
        email: editEmail.trim() || userProfile.email,
        avatar: editAvatar || null,
      });
      setUserProfile(res.data);
      localStorage.setItem("auth_user", JSON.stringify(res.data));
      alert(res.message || "Profile updated successfully!");
      setActiveTab("home");
    } catch (err: any) {
      alert(err?.message || "Failed to update profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrow = async (bookToBorrow: ApiBook) => {
    if (!getToken()) {
      alert("Please login to borrow books.");
      navigate("/");
      return;
    }
    setActionLoading(true);
    try {
      await borrowBook(bookToBorrow.id);
      alert(`Successfully borrowed: ${bookToBorrow.title}`);
      setSelectedBook(null);
      setActiveTab("logs");
      await refreshLogsAndBooks();
    } catch (err: any) {
      alert(err?.message || "Failed to borrow book.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (bookToReturn: ApiBook) => {
    if (!getToken()) {
      alert("Please login to return books.");
      navigate("/");
      return;
    }
    setActionLoading(true);
    try {
      await returnBook(bookToReturn.id);
      alert(`Successfully returned: ${bookToReturn.title}`);
      setSelectedBook(null);
      setActiveTab("logs");
      await refreshLogsAndBooks();
    } catch (err: any) {
      alert(err?.message || "Failed to return book.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try { if (getToken()) await logout(); } catch {}
    clearToken();
    localStorage.removeItem("auth_user");
    navigate("/");
  };

  const filteredBooks = books; // server-filtered via effect; keep name for minimal UI changes

  const categoryCards = useMemo(() => {
    const fallback: Category[] = [
      { id: 1, name: "Computer Science", image: "computer science.png" },
      { id: 2, name: "Mathematics", image: "Mathec.png" },
      { id: 3, name: "Literature", image: "literature.png" },
      { id: 4, name: "History", image: "History.png" },
    ];
    return categories.length ? categories : fallback;
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#F5FAFD] flex flex-col items-center p-6">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-4 border-b border-gray-200 mb-8">
        
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Cordova Public College Logo" className="w-14 h-14 object-contain" />
        </div>

        <nav className="flex items-center gap-8">
          <button 
            onClick={() => { setActiveTab("home"); setSelectedCategory(null); setSelectedBook(null); setSearchQuery(""); }}
            className={`px-8 py-2 rounded-full font-serif tracking-wider text-sm transition-colors cursor-pointer ${
              activeTab === "home" && !selectedCategory && !selectedBook
                ? "bg-[#D9D9D9] font-semibold text-black shadow-inner" 
                : "text-gray-700 hover:text-black"
            }`}
          >
            HOME
          </button>
          <button 
            onClick={() => { setActiveTab("books"); setSelectedCategory(null); setSelectedBook(null); setSearchQuery(""); }}
            className={`px-8 py-2 rounded-full font-serif tracking-wider text-sm transition-colors cursor-pointer ${
              activeTab === "books" || selectedCategory || selectedBook
                ? "bg-[#D9D9D9] font-semibold text-black shadow-inner" 
                : "text-gray-700 hover:text-black"
            }`}
          >
            BOOKS
          </button>
        </nav>

        <div className="relative flex items-center gap-3">
          <span className="hidden sm:block text-xs font-medium text-gray-800">
            {userProfile.name}
          </span>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow focus:outline-none overflow-hidden cursor-pointer hover:opacity-90 border-2 border-white"
          >
            {userProfile.avatar ? (
              <img src={resolveAsset(userProfile.avatar) || userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-sm">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-semibold text-gray-900 truncate">{userProfile.name}</p>
                <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
              </div>
              <button 
                onClick={() => { 
                  setEditName(userProfile.name);
                  setEditEmail(userProfile.email);
                  setEditAvatar(userProfile.avatar || "");
                  setActiveTab("edit-profile"); 
                  setIsProfileOpen(false); 
                  setSelectedBook(null); 
                  setSelectedCategory(null); 
                }}
                className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => { setActiveTab("logs"); setIsProfileOpen(false); setSelectedBook(null); setSelectedCategory(null); }}
                className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                Profile Logs
              </button>
              {userProfile.is_admin ? (
                <button
                  onClick={() => { setIsProfileOpen(false); navigate("/admin"); }}
                  className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                >
                  Database
                </button>
              ) : null}
              <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-red-600 hover:bg-gray-100">Log out</button>
            </div>
          )}
        </div>

      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col gap-8">
        
        <div className="w-full relative flex items-center">
          <span className="absolute left-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
              setSelectedBook(null);
              setActiveTab("home");
            }}
            placeholder="Search for books:"
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {loading ? <p className="text-sm text-gray-600">Loading from backend...</p> : null}

        {activeTab === "edit-profile" ? (
          <div className="max-w-lg w-full mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-black">Edit Profile</h2>
              <button onClick={() => setActiveTab("home")} className="text-sm text-gray-500 hover:text-black cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden shadow-md border-4 border-[#F5FAFD]">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : userProfile.avatar ? (
                    <img src={resolveAsset(userProfile.avatar) || userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <label className="px-4 py-1.5 bg-[#D9D9D9] hover:bg-gray-300 text-xs font-medium text-black rounded-full cursor-pointer transition-colors">
                  Change Profile Picture
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 pl-1">Student Name:</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full h-10 px-4 bg-[#F5FAFD] border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 pl-1">Gmail / Email:</label>
                <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full h-10 px-4 bg-[#F5FAFD] border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]" />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={() => setActiveTab("home")} className="px-5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2 bg-[#143D99] hover:bg-blue-900 disabled:opacity-60 text-white text-xs font-medium rounded-full shadow cursor-pointer">
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === "logs" ? (
          <div className="flex flex-col gap-8 relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="absolute top-6 right-8 flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden shadow border-2 border-gray-100">
                {userProfile.avatar ? (
                  <img src={resolveAsset(userProfile.avatar) || userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <span className="text-xs font-bold text-black">{userProfile.name}</span>
            </div>

            <div className="flex flex-col items-center mb-2">
              <h1 className="text-xl font-['Irish_Grover',cursive] tracking-wide text-black mb-1">CPC Library</h1>
              <img src={BooksImg} alt="Books Stack" className="w-16 h-16 object-contain mb-1" />
              <p className="text-xs font-['Irish_Grover',cursive] tracking-wide text-black">Library Book Search App</p>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="bg-[#D8BABA] px-8 py-1.5 rounded-full">
                <h2 className="text-sm font-bold tracking-wider text-black uppercase font-serif">
                  BOOKS BORROWED BY {userProfile.name.toUpperCase()}:
                </h2>
              </div>
            </div>

            {!getToken() ? (
              <p className="text-sm text-gray-600">Please login to view your borrow logs.</p>
            ) : userLogs.length === 0 ? (
              <p className="text-sm text-gray-600">No borrow logs yet.</p>
            ) : (
              <div className="flex flex-col gap-10">
                {userLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-gray-100 pb-8 last:border-none">
                    <div className="flex items-center gap-6">
                      <div className="w-28 aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white p-2 flex items-center justify-center border border-gray-100 shrink-0">
                        {log.book?.image ? (
                          <img src={resolveAsset(log.book.image)} alt={log.book.title} className="w-full h-full object-contain" />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{log.book?.title}</span>
                        <div className="bg-[#3B7A57] px-4 py-1.5 rounded-lg text-white text-xs font-semibold tracking-wide text-center w-fit">
                          {log.book?.category}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-700 font-medium">{log.borrow_date || "-"}</p>
                          <p className="text-xs text-gray-700 font-medium">Time: {log.borrow_time || "-"}</p>
                        </div>
                        <div className="bg-[#D9D9D9] border border-gray-400 px-6 py-1.5 rounded-full text-xs font-semibold text-black shadow-inner">
                          Borrowed
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        {log.status === "returned" || log.return_status === "Returned" ? (
                          <>
                            <div className="text-center">
                              <p className="text-xs text-gray-700 font-medium">{log.return_date || "-"}</p>
                              <p className="text-xs text-gray-700 font-medium">Time: {log.return_time || "-"}</p>
                            </div>
                            <div className="bg-[#D9D9D9] border border-gray-400 px-6 py-1.5 rounded-full text-xs font-semibold text-black shadow-inner">
                              Returned
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-center opacity-0"><p className="text-xs">Placeholder</p></div>
                            <div className="bg-[#D9D9D9] border border-red-300 px-6 py-1.5 rounded-full text-xs font-semibold text-red-700 shadow-inner">
                              Not yet
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={() => setActiveTab("home")} className="text-sm font-medium text-black hover:text-[#143D99] cursor-pointer">← Back</button>
            </div>
          </div>
        ) : selectedBook ? (
          <div className="flex flex-col gap-6 relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center mb-2">
              <img src={BooksImg} alt="Books Stack" className="w-14 h-14 object-contain mb-1" />
              <p className="text-xs font-['Irish_Grover',cursive] tracking-wide text-black mb-1">Library Book Search App</p>
            </div>

            <button onClick={() => setSelectedBook(null)} className="self-start text-sm font-medium text-black hover:text-[#143D99] flex items-center gap-2 cursor-pointer">
              <span>←</span> Back to home
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#D9D9D9]/40 p-6 rounded-2xl border border-gray-200">
              <div className="flex justify-center">
                <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white p-2 flex items-center justify-center">
                  <img src={resolveAsset(selectedBook.image)} alt={selectedBook.title} className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="bg-[#D8BABA] px-6 py-3 rounded-lg text-center shadow-sm">
                  <span className="text-sm font-bold text-black">{selectedBook.title}</span>
                </div>
                <div className="bg-[#D8BABA] px-6 py-3 rounded-lg text-center shadow-sm">
                  <span className="text-sm font-bold text-black">Availability: {selectedBook.availability}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#D9D9D9]/70 p-6 rounded-xl flex flex-col gap-2">
              <h3 className="font-bold text-sm text-black">Description:</h3>
              <p className="text-xs md:text-sm text-gray-800 leading-relaxed">{selectedBook.description}</p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-2">
              <button onClick={() => handleBorrow(selectedBook)} disabled={actionLoading} className="w-36 py-2 bg-[#D8BABA] hover:bg-[#c8a8a8] disabled:opacity-60 text-black font-semibold text-xs tracking-wider rounded-full shadow transition-colors cursor-pointer">
                Borrow
              </button>
              <button onClick={() => handleReturn(selectedBook)} disabled={actionLoading} className="w-36 py-2 bg-[#D8BABA] hover:bg-[#c8a8a8] disabled:opacity-60 text-black font-semibold text-xs tracking-wider rounded-full shadow transition-colors cursor-pointer">
                Return
              </button>
            </div>
          </div>
        ) : activeTab === "home" && !selectedCategory && !searchQuery ? (
          <>
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-serif font-semibold text-black">Categories:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryCards.map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="rounded-xl overflow-hidden shadow-md relative h-36 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform"
                  >
                    <img src={resolveAsset(cat.image || `${cat.name.toLowerCase()}.png`)} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <h3 className="font-serif font-bold text-lg text-white text-center tracking-wide z-10 px-2 drop-shadow uppercase">{cat.name}</h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4 mt-2">
              <h2 className="text-base font-serif font-semibold text-black">Featured Books:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {featured.map((book) => (
                  <div key={book.id} onClick={() => setSelectedBook(book)} className="flex flex-col items-center cursor-pointer group">
                    <div className="w-full h-64 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-3 mb-2 overflow-hidden">
                      <img src={resolveAsset(book.image)} alt={book.title} className="w-full h-full object-contain" />
                    </div>
                    <span className="w-full py-2 bg-black text-white text-xs font-medium text-center rounded-full shadow">
                      {book.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-col gap-6 relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => { setSelectedCategory(null); setSearchQuery(""); setActiveTab("home"); }}
              className="absolute top-4 right-4 w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center font-bold shadow transition-colors cursor-pointer"
              title="Close"
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-2">
              <img src={BooksImg} alt="Books Stack" className="w-14 h-14 object-contain mb-1" />
              <p className="text-xs font-['Irish_Grover',cursive] tracking-wide text-black mb-1">Library Book Search App</p>
              <div className="bg-[#D5B8B8] px-8 py-1.5 rounded-full mt-1">
                <h2 className="text-sm font-bold tracking-wider text-black uppercase font-serif">
                  {selectedCategory ? `${selectedCategory.toUpperCase()} BOOKS:` : searchQuery ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"` : "BOOKS:"}
                </h2>
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} onClick={() => setSelectedBook(book)} className="group cursor-pointer flex flex-col items-center">
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white p-3 flex items-center justify-center border border-gray-100 group-hover:scale-[1.02] transition-transform">
                      <img src={resolveAsset(book.image)} alt={book.title} className="w-full h-full object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">No books found.</div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
