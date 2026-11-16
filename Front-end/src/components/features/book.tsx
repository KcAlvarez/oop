import { useState } from "react";
import Logo from "@/assets/image 1.png";
import BooksImg from "@/assets/image 2.png";
import ComputerScienceImg from "@/assets/computer science.png";
import MathematicsImg from "@/assets/Mathec.png";
import LiteratureImg from "@/assets/literature.png";
import HistoryImg from "@/assets/history.png"; // Added History category asset import
import InfoTechImg from "@/assets/information T.png";
import AlgoImg from "@/assets/Algo.png";
import JavaOopImg from "@/assets/java oop.png";
import CalculusImg from "@/assets/calculos.png";
import MachinesLearnImg from "@/assets/machine.png";

// Full list of books with assigned categories
const booksList = [
  { id: 1, title: "A Textbook of Information Technology", image: InfoTechImg, category: "Computer Science" },
  { id: 2, title: "Algorithms in C++", image: AlgoImg, category: "Computer Science" },
  { id: 3, title: "Java OOP Simplified", image: JavaOopImg, category: "Computer Science" },
  { id: 4, title: "Everything You Need to Ace Computer Science and Coding", image: ComputerScienceImg, category: "Computer Science" },
  { id: 5, title: "First Semester Calculus", image: CalculusImg, category: "Mathematics" },
  { id: 6, title: "Cambridge Lower Secondary Mathematics", image: MathematicsImg, category: "Mathematics" },
  { id: 7, title: "Why Machines Learn", image: MachinesLearnImg, category: "Literature" },
  // { id: 8, title: "World History Book", image: HistoryBookImg, category: "History" }, // Add history books here when ready
];

export default function Home() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "books">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter books based on search query or selected category
  const filteredBooks = booksList.filter((book) => {
    if (searchQuery) {
      return book.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (selectedCategory) {
      return book.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5FAFD] flex flex-col items-center p-6">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-4 border-b border-gray-200 mb-8">
        
        {/* Left: College Logo */}
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Cordova Public College Logo"
            className="w-14 h-14 object-contain"
          />
        </div>

        <nav className="flex items-center gap-8">
          <button 
            onClick={() => { setActiveTab("home"); setSelectedCategory(null); setSearchQuery(""); }}
            className={`px-8 py-2 rounded-full font-serif tracking-wider text-sm transition-colors cursor-pointer ${
              activeTab === "home" && !selectedCategory
                ? "bg-[#D9D9D9] font-semibold text-black shadow-inner" 
                : "text-gray-700 hover:text-black"
            }`}
          >
            HOME
          </button>
          <button 
            onClick={() => { setActiveTab("books"); setSelectedCategory(null); setSearchQuery(""); }}
            className={`px-8 py-2 rounded-full font-serif tracking-wider text-sm transition-colors cursor-pointer ${
              activeTab === "books" || selectedCategory
                ? "bg-[#D9D9D9] font-semibold text-black shadow-inner" 
                : "text-gray-700 hover:text-black"
            }`}
          >
            BOOKS
          </button>
        </nav>

        {/* Right: Profile Avatar & Dropdown Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow focus:outline-none overflow-hidden cursor-pointer hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-sm">
              <a href="#signup" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Sign up</a>
              <a href="#logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Log out</a>
              <a href="#logs" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile Logs</a>
            </div>
          )}
        </div>

      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col gap-8">
        
        {/* Search Bar */}
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
            }}
            placeholder="Search for books:"
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
          />
        </div>

        {/* View 1: Homepage View */}
        {activeTab === "home" && !selectedCategory && !searchQuery ? (
          <>
            {/* Categories Section */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-serif font-semibold text-black">Categories:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Computer Science Category Card */}
                <div 
                  onClick={() => setSelectedCategory("Computer Science")}
                  className="rounded-xl overflow-hidden shadow-md relative h-32 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform"
                >
                  <img src={ComputerScienceImg} alt="Computer Science" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-blue-900/40"></div>
                  <h3 className="font-serif font-bold text-sm text-white text-center tracking-wide z-10 px-2 drop-shadow">COMPUTER SCIENCE</h3>
                </div>

                {/* Mathematics Category Card */}
                <div 
                  onClick={() => setSelectedCategory("Mathematics")}
                  className="rounded-xl overflow-hidden shadow-md relative h-32 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform"
                >
                  <img src={MathematicsImg} alt="Mathematics" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-amber-900/30"></div>
                  <h3 className="font-serif font-bold text-sm text-white text-center tracking-wide z-10 px-2 drop-shadow">MATHEMATICS</h3>
                </div>

                {/* Literature Category Card */}
                <div 
                  onClick={() => setSelectedCategory("Literature")}
                  className="rounded-xl overflow-hidden shadow-md relative h-32 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform"
                >
                  <img src={LiteratureImg} alt="Literature" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gray-900/40"></div>
                  <h3 className="font-serif font-bold text-sm text-white text-center tracking-wide z-10 px-2 drop-shadow">Literature</h3>
                </div>

                {/* History Category Card (Added) */}
                <div 
                  onClick={() => setSelectedCategory("History")}
                  className="rounded-xl overflow-hidden shadow-md relative h-32 flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform"
                >
                  <img src={HistoryImg} alt="History" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-900/50"></div>
                  <h3 className="font-serif font-bold text-sm text-white text-center tracking-wide z-10 px-2 drop-shadow">History</h3>
                </div>

              </div>
            </section>

            {/* Featured Books Section */}
            <section className="flex flex-col gap-4 mt-2">
              <h2 className="text-base font-serif font-semibold text-black">Featured Books:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="flex flex-col items-center">
                  <div className="w-full h-64 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-3 mb-2 overflow-hidden">
                    <img src={InfoTechImg} alt="Information Technology" className="w-full h-full object-contain" />
                  </div>
                  <span className="w-full py-2 bg-black text-white text-xs font-medium text-center rounded-full shadow">
                    Information Technology
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full h-64 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-3 mb-2 overflow-hidden">
                    <img src={AlgoImg} alt="Algorithms in C++" className="w-full h-full object-contain" />
                  </div>
                  <span className="w-full py-2 bg-black text-white text-xs font-medium text-center rounded-full shadow">
                    Algorithms in C++
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full h-64 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-3 mb-2 overflow-hidden">
                    <img src={JavaOopImg} alt="Java OOP simplified" className="w-full h-full object-contain" />
                  </div>
                  <span className="w-full py-2 bg-black text-white text-xs font-medium text-center rounded-full shadow">
                    Java OOP simplified
                  </span>
                </div>

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
                  <div key={book.id} className="group cursor-pointer flex flex-col items-center">
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-white p-3 flex items-center justify-center mb-2 border border-gray-100">
                      <img src={book.image} alt={book.title} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-medium text-center text-black px-1">
                      {book.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                No books found.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}